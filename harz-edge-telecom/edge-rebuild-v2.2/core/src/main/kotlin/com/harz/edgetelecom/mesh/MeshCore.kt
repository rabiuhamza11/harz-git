package com.harz.edgetelecom.mesh

/**
 * MeshCore — the HARZ-Mesh data plane, radio-agnostic, JVM-pure.
 *
 * Implements the frozen protocol EXACTLY (the acceptance harness's 8 checks):
 *  T1  direct 2-node delivery (HELLO -> DATA -> ACK)
 *  T2  multi-hop A->B->C: relay forwarding, route append [A,B], hops=1, ACK return
 *  T2b payload integrity: chunked reassembly stays byte-identical
 *  T3  TTL attack (G2-C): ttl 0 never forwarded, ttl 1 stops at relay, ttl 2+ traverses
 *  T4  dedup: same (src,seq) delivered exactly once
 *  T5  outage recovery (G2-E): peer loss -> frames held -> byte-identical flush on return
 *
 * FROZEN RULE (Sep 6 report §3): NO retransmit in the app data plane.
 * Loss is counted honestly; the harness's retransmit was harness-only.
 */
class MeshCore(
    val self: EdgeId,
    private val listener: Listener
) {
    interface Listener {
        fun onData(src: EdgeId, seq: Long, hops: Int, route: List<EdgeId>, payload: ByteArray)
        fun onAck(src: EdgeId, seq: Long)
        fun onPeerJoined(peer: EdgeId, via: String)
        fun onPeerLost(peer: EdgeId)
        fun onMetric(event: String, detail: String)
    }

    /** Registered peers: edgeId -> transport. */
    private val peers = LinkedHashMap<EdgeId, Transport>()
    /** transport -> registered edgeId (reverse index). */
    private val transportIds = HashMap<Transport, EdgeId>()
    private val dedup = DedupCache()
    val store = StoreAndForward()
    var seqCounter: Long = 0
        private set

    // ---------------------------------------------------------------- wiring

    /** A new transport appeared (GO accepted / client socket connected). Await HELLO. */
    fun attach(t: Transport) {
        t.onFrame { raw -> safeHandle(raw, t) }
    }

    /** Transport closed (peer died / socket reset) — G2-E observation point. */
    fun detach(t: Transport) {
        val id = transportIds.remove(t) ?: return
        peers.remove(id)
        listener.onPeerLost(id)
        listener.onMetric("peer_lost", id.value)
    }

    private fun safeHandle(raw: ByteArray, t: Transport) {
        val f = try { MeshFrame.decode(raw) } catch (e: Exception) {
            listener.onMetric("bad_frame", e.message ?: "malformed")
            return
        }
        handle(f, t)
    }

    private fun handle(f: MeshFrame, from: Transport) {
        when (f.type) {
            MeshProtocol.TYPE_HELLO -> {
                register(f.src, from)
                from.send(MeshFrame.helloAck(self, f.src, f.seq).encode())
            }
            MeshProtocol.TYPE_HELLO_ACK -> register(f.src, from)
            MeshProtocol.TYPE_BYE -> {
                transportIds.remove(from)?.let { peers.remove(it); listener.onPeerLost(it) }
            }
            MeshProtocol.TYPE_DATA -> onDataFrame(f, from)
            MeshProtocol.TYPE_ACK -> onAckFrame(f, from)
        }
    }

    private fun register(id: EdgeId, t: Transport) {
        val isNew = !peers.containsKey(id)
        transportIds[t] = id
        peers[id] = t
        if (isNew) {
            listener.onPeerJoined(id, t.describe())
            listener.onMetric("peer_joined", id.value)
        } else {
            listener.onMetric("peer_back", id.value)
        }
        // Flush on EVERY successful registration: a returning peer must receive
        // held frames (T5 shape). Receiver dedup guards against double-flush.
        flushStore(t, id)
    }

    /** On (re)connection: drain held frames toward the returning peer. Byte-identical. */
    private fun flushStore(t: Transport, peerId: EdgeId) {
        val held = store.drain(peerId)
        if (held.isNotEmpty()) listener.onMetric("flush", "${peerId.value}:${held.size}")
        for (frame in held) t.send(frame.encode())
        // Frames held for OTHER peers: the returning peer may be the relay toward them (T5 shape).
        val others = ArrayList<MeshFrame>()
        for (entry in store.heldSnapshot()) {
            if (entry.key != peerId.value) { others.addAll(store.drainKey(entry.key)); }
        }
        for (frame in others) t.send(frame.encode())
    }

    // ---------------------------------------------------------------- DATA plane

    private fun onDataFrame(f: MeshFrame, from: Transport) {
        if (f.dst.value == self.value) {
            // Deliver locally — exactly once (T4).
            if (dedup.seen(f.src, f.seq)) { listener.onMetric("dup_dropped", "${f.src.value}:${f.seq}"); return }
            listener.onData(f.src, f.seq, f.hops, f.route, f.payload)
            // ACK return path along the way it came (T2 check 4).
            from.send(MeshFrame.ack(self, f.src, f.seq, f.route).encode())
            return
        }
        // Not for me: relay plane. Dedup before forwarding (T4 at the relay).
        if (dedup.seen(f.src, f.seq)) { listener.onMetric("dup_dropped", "${f.src.value}:${f.seq}"); return }

        // G2-C frozen TTL semantics:
        if (f.ttl <= MeshProtocol.Ttl.STOP_AT_RELAY) {
            // ttl 0: never forwarded. ttl 1: stops HERE at the relay.
            listener.onMetric("ttl_stop", "ttl=${f.ttl} seq=${f.seq} at=${self.value}")
            return
        }

        val forwarded = f.copy(ttl = f.ttl - 1, hops = f.hops + 1, route = f.route + self)
        val direct = peers[f.dst]
        if (direct != null && direct.isConnected()) {
            direct.send(forwarded.encode())
            listener.onMetric("forwarded", "${f.src.value}->${f.dst.value} via ${self.value}")
        } else {
            // Flood toward other peers (relay shape: GO with several clients).
            var sentTo = 0
            for ((id, t) in peers) {
                if (id == f.src) continue // never bounce back to sender
                if (id == self) continue
                if (t.isConnected()) { t.send(forwarded.encode()); sentTo++ }
            }
            if (sentTo > 0) {
                listener.onMetric("forwarded", "${f.src.value}->${f.dst.value} flood x$sentTo")
            } else {
                store.hold(f.dst, f.copy()) // hold ORIGINAL frame; flush is byte-identical
                listener.onMetric("held", "${f.dst.value}:${f.seq}")
            }
        }
    }

    private fun onAckFrame(f: MeshFrame, from: Transport) {
        if (f.dst.value == self.value) {
            listener.onAck(f.src, f.seq)
            return
        }
        // Relay the ACK back toward its destination the way it came.
        val direct = peers[f.dst]
        if (direct != null && direct.isConnected()) {
            direct.send(f.encode())
        } else {
            for ((id, t) in peers) {
                if (id == f.src) continue
                if (t.isConnected()) { t.send(f.encode()); return }
            }
            store.hold(f.dst, f.copy())
            listener.onMetric("held_ack", "${f.dst.value}:${f.seq}")
        }
    }

    // ---------------------------------------------------------------- send API

    /**
     * Send one numbered chunk to dst. Route starts with the sender ([A] in the
     * desk's check-3 shape); each forwarder appends itself (-> [A,B]).
     * Pacing (20 ms) is the caller's loop — the core never blocks the radio thread.
     */
    fun sendChunk(dst: EdgeId, chunk: ByteArray, ttl: Int = MeshProtocol.DEFAULT_TTL): Long {
        val seq = seqCounter++
        val frame = MeshFrame(
            type = MeshProtocol.TYPE_DATA, src = self, dst = dst, seq = seq,
            ttl = ttl, hops = 0, route = listOf(self), payload = chunk
        )
        val direct = peers[dst]
        if (direct != null && direct.isConnected()) {
            direct.send(frame.encode())
        } else {
            // No direct link: send toward any relay peer, else hold (T5).
            var relayed = false
            for ((id, t) in peers) {
                if (t.isConnected()) { t.send(frame.encode()); relayed = true; break }
            }
            if (!relayed) { store.hold(dst, frame); listener.onMetric("held", "${dst.value}:${seq}") }
        }
        return seq
    }

    /** Split a payload into protocol-sized chunks (900 B). Caller paces and numbers. */
    fun chunkPayload(data: ByteArray, chunkSize: Int = MeshProtocol.CHUNK_SIZE): List<ByteArray> =
        if (data.isEmpty()) listOf(ByteArray(0))
        else data.toList().chunked(chunkSize).map { it.toByteArray() }

    fun peersOnline(): List<EdgeId> = peers.keys.toList()
}
