package com.harz.edgetelecom.mesh

import java.io.ByteArrayOutputStream
import java.nio.ByteBuffer
import java.util.zip.CRC32

/**
 * HARZ-Mesh wire frame.
 *
 * Layout (all big-endian):
 *   magic     u32   0x48415A5A
 *   type      u8    HELLO | HELLO_ACK | DATA | ACK | BYE
 *   src       4B    sender edge-ID
 *   dst       4B    destination edge-ID ("\0\0\0\0" = broadcast/local-any)
 *   seq       u32   per-sender chunk sequence number (ACKs echo it)
 *   ttl       u8    remaining hops-to-live (G2-C semantics in MeshCore)
 *   hops      u8    hop count, incremented by each forwarder
 *   routeLen  u8    number of 4-byte edge-IDs following
 *   route     routeLen * 4B   path of forwarders (excluding src)
 *   sigLen    u8    0 = unsigned (logic layer / G1-G2 runs), 64 = Ed25519 signature
 *   sig       sigLen bytes
 *   payLen    u32
 *   payload   payLen bytes
 *   crc32     u32   CRC32 over all preceding bytes
 *
 * The Sep 6 logic harness validated exactly these fields: dedup on (src,seq),
 * TTL rules, hop counting, route append, ACK return path, store-and-forward
 * of byte-identical payloads. Signatures exist in the frame but stay length-0
 * at the logic layer (IdentityManager activates them in the app build).
 */
data class MeshFrame(
    val type: Int,
    val src: EdgeId,
    val dst: EdgeId,
    val seq: Long,
    val ttl: Int,
    val hops: Int,
    val route: List<EdgeId>,
    val sig: ByteArray = ByteArray(0),
    val payload: ByteArray = ByteArray(0)
) {
    fun encode(): ByteArray {
        val buf = ByteBuffer.allocate(4 + 1 + 4 + 4 + 4 + 1 + 1 + 1 + route.size * 4 + 1 + sig.size + 4 + payload.size + 4)
        buf.putInt(MeshProtocol.MAGIC)
        buf.put(type.toByte())
        buf.put(src.bytes())
        buf.put(dst.bytes())
        buf.putInt(seq.toInt())
        buf.put(ttl.toByte())
        buf.put(hops.toByte())
        buf.put(route.size.toByte())
        for (e in route) buf.put(e.bytes())
        buf.put(sig.size.toByte())
        buf.put(sig)
        buf.putInt(payload.size)
        buf.put(payload)
        val body = buf.array().copyOfRange(0, buf.position())
        val crc = CRC32().apply { update(body) }
        return body + ByteBuffer.allocate(4).putInt(crc.value.toInt()).array()
    }

    override fun equals(other: Any?): Boolean = other is MeshFrame && other.encode().contentEquals(encode())
    override fun hashCode(): Int = encode().contentHashCode()

    companion object {
        /** Decode one frame from a complete byte buffer. Throws on any malformation. */
        fun decode(raw: ByteArray): MeshFrame {
            require(raw.size >= 29) { "frame too short: ${raw.size}B" }
            val bb = ByteBuffer.wrap(raw)
            val magic = bb.int
            require(magic == MeshProtocol.MAGIC) { "bad magic 0x%08x".format(magic) }
            val type = bb.get().toInt() and 0xFF
            val src = EdgeId.fromBytes(raw, bb.position()).also { if (true) bb.position(bb.position() + 4) }
            val dst = EdgeId.fromBytes(raw, bb.position()).also { if (true) bb.position(bb.position() + 4) }
            val seq = bb.int.toLong() and 0xFFFFFFFFL
            val ttl = bb.get().toInt() and 0xFF
            val hops = bb.get().toInt() and 0xFF
            val routeLen = bb.get().toInt() and 0xFF
            require(routeLen <= MeshProtocol.MAX_ROUTE) { "route overflow: $routeLen" }
            val route = ArrayList<EdgeId>(routeLen)
            repeat(routeLen) {
                route.add(EdgeId.fromBytes(raw, bb.position()))
                bb.position(bb.position() + 4)
            }
            val sigLen = bb.get().toInt() and 0xFF
            require(sigLen == 0 || sigLen == 64) { "bad sigLen $sigLen" }
            val sig = ByteArray(sigLen).also { bb.get(it) }
            val payLen = bb.int
            require(payLen in 0..1_048_576) { "payload length out of bounds: $payLen" }
            val payload = ByteArray(payLen).also { bb.get(it) }
            val crcOff = bb.position()
            require(raw.size - crcOff == 4) { "trailing bytes after payload: ${raw.size - crcOff - 4}" }
            val crcStored = bb.int.toLong() and 0xFFFFFFFFL
            val crc = CRC32().apply { update(raw, 0, crcOff) }
            require(crc.value == crcStored) { "CRC mismatch: stored=$crcStored computed=${crc.value}" }
            return MeshFrame(type, src, dst, seq, ttl, hops, route, sig, payload)
        }

        /** HELLO frame a new client sends to register its edge-ID. */
        fun hello(edgeId: EdgeId, seq: Long = 0): MeshFrame =
            MeshFrame(MeshProtocol.TYPE_HELLO, edgeId, EdgeId("    "), seq, 0, 0, emptyList())

        /** HELLO_ACK the GO answers with — carries the GO's own edge-ID. */
        fun helloAck(goEdgeId: EdgeId, to: EdgeId, seq: Long): MeshFrame =
            MeshFrame(MeshProtocol.TYPE_HELLO_ACK, goEdgeId, to, seq, 0, 0, emptyList())

        /** DATA chunk. */
        fun data(src: EdgeId, dst: EdgeId, seq: Long, ttl: Int, chunk: ByteArray): MeshFrame =
            MeshFrame(MeshProtocol.TYPE_DATA, src, dst, seq, ttl, 0, emptyList(), ByteArray(0), chunk)

        /** ACK — src=original receiver, dst=original sender, seq echoes the DATA seq. */
        fun ack(receiver: EdgeId, sender: EdgeId, seq: Long, route: List<EdgeId>): MeshFrame =
            MeshFrame(MeshProtocol.TYPE_ACK, receiver, sender, seq, 0, 0, route)

        fun bye(edgeId: EdgeId): MeshFrame =
            MeshFrame(MeshProtocol.TYPE_BYE, edgeId, EdgeId("    "), 0, 0, 0, emptyList())
    }
}
