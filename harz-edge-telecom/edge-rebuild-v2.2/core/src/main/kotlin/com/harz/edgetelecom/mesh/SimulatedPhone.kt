package com.harz.edgetelecom.mesh

import java.io.File
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.util.concurrent.ConcurrentLinkedQueue
import java.util.concurrent.atomic.AtomicLong

/**
 * SimulatedPhone — one JVM process acting as one mesh phone, exactly like the
 * Sep 6 harness (and the desk's acceptance harness). Runs MeshCore over TCP.
 *
 * CLI:
 *   GO / relay / receiver:   SimulatedPhone --id BBBB --go --port 8988
 *   Client (sender etc.):    SimulatedPhone --id AAAA --connect 127.0.0.1:8988
 *
 * Then drive it over its control port (default goPort+ctl, e.g. 8989 for GO):
 *   POST /send?dst=CCCC&ttl=8&n=100&size=900&paceMs=20
 *   GET  /status   -> peers, delivered count, acks, held frames, md5s
 *   GET  /metrics  -> CSV lines (TestMetricsCollector format)
 *   POST /die      -> simulate battery death (closes sockets, keeps DTN store on disk)
 *   POST /rise     -> return from death (reload store, re-listen)
 *
 * The 8 acceptance checks map onto these primitives; the desk runs their
 * harness against these endpoints independently.
 */
class SimulatedPhone(
    val id: EdgeId,
    val goMode: Boolean,
    val port: Int,
    val ctlPort: Int
) {
    data class Delivered(val src: String, val seq: Long, val hops: Int, val route: List<String>, val md5: String)

    val delivered = ConcurrentLinkedQueue<Delivered>()
    val acks = AtomicLong(0)
    val ackSeqs = ConcurrentLinkedQueue<String>()
    val metrics = ConcurrentLinkedQueue<String>()

    val core = MeshCore(id, object : MeshCore.Listener {
        override fun onData(src: EdgeId, seq: Long, hops: Int, route: List<EdgeId>, payload: ByteArray) {
            delivered.add(Delivered(src.value, seq, hops, route.map { it.value }, md5(payload)))
            metrics.add("data,src=${src.value},seq=$seq,hops=$hops,route=${route.joinToString(">")}")
        }
        override fun onAck(src: EdgeId, seq: Long) { acks.incrementAndGet(); ackSeqs.add("${src.value}:$seq") }
        override fun onPeerJoined(peer: EdgeId, via: String) { metrics.add("peer_joined,${peer.value},$via") }
        override fun onPeerLost(peer: EdgeId) { metrics.add("peer_lost,${peer.value}") }
        override fun onMetric(event: String, detail: String) { metrics.add("$event,$detail") }
    })

    private var server: ServerSocket? = null
    private var ctlServer: ServerSocket? = null
    val transports = ConcurrentLinkedQueue<TcpTransport>()

    fun md5(data: ByteArray): String {
        val d = java.security.MessageDigest.getInstance("MD5").digest(data)
        return d.joinToString("") { "%02x".format(it) }
    }

    fun start() {
        if (goMode) {
            server = TcpTransport.serve(port) { t -> transports.add(t); core.attach(t) }
        }
        ctlServer = ServerSocket(ctlPort)
        Thread { ctlLoop() }.apply { isDaemon = true; name = "ctl-$id"; start() }
        println("[phone ${id.value}] up — go=$goMode port=$port ctl=$ctlPort")
    }

    fun connect(host: String, port: Int) {
        val t = TcpTransport.connect(host, port)
        transports.add(t)
        core.attach(t)
        t.send(MeshFrame.hello(id).encode())
    }

    /** Send n chunks of `size` bytes to dst at paceMs pacing. Returns first seq. */
    fun sendBurst(dst: EdgeId, n: Int, size: Int, ttl: Int, paceMs: Long, label: String): Long {
        val chunk = ByteArray(size) { (it % 251).toByte() }
        var first = -1L
        val t0 = System.currentTimeMillis()
        for (i in 0 until n) {
            val seq = core.sendChunk(dst, chunk, ttl)
            if (first < 0) first = seq
            if (paceMs > 0) Thread.sleep(paceMs)
        }
        metrics.add("burst,label=$label,dst=${dst.value},n=$n,ms=${System.currentTimeMillis() - t0}")
        return first
    }

    private fun ctlLoop() {
        val srv = ctlServer!!
        while (!srv.isClosed) {
            val s = try { srv.accept() } catch (e: Exception) { break }
            try {
                val req = s.getInputStream().bufferedReader().readLine()
                if (req == null) { s.close(); continue }
                val parts = req.split(" ")
                val methodPath = parts.firstOrNull() ?: ""
                val body = if (parts.size > 1) java.net.URLDecoder.decode(parts[1], "UTF-8") else ""
                val resp = handleCtl(methodPath.substringBefore(' '), methodPath.substringAfter(' ', ""), body)
                s.getOutputStream().write(resp.toByteArray())
            } finally { try { s.close() } catch (_: Exception) {} }
        }
    }

    private fun handleCtl(method: String, path: String, body: String): String {
        val params = body.split("&").mapNotNull {
            val kv = it.split("=", limit = 2)
            if (kv.size == 2) kv[0] to kv[1] else null
        }.toMap()
        return when ("$method $path") {
            "GET /status" -> statusJson()
            "GET /metrics" -> metrics.joinToString("\n") + "\n"
            "POST /send" -> {
                val dst = EdgeId(params["dst"] ?: return "err: dst required")
                val n = (params["n"] ?: "1").toInt()
                val size = (params["size"] ?: "900").toInt()
                val ttl = (params["ttl"] ?: "8").toInt()
                val pace = (params["paceMs"] ?: "20").toLong()
                val first = sendBurst(dst, n, size, ttl, pace, params["label"] ?: "burst")
                "ok:first=$first"
            }
            "POST /connect" -> {
                val hp = params["to"] ?: return "err: to required"
                val h = hp.substringBefore(":"); val p = hp.substringAfter(":").toInt()
                connect(h, p)
                "ok:connected=$hp"
            }
            "POST /die" -> { die(); "ok:dead" }
            else -> "err:unknown $method $path"
        }
    }

    private fun statusJson(): String = buildString {
        append("{")
        append("\"id\":\"${id.value}\",")
        append("\"peers\":[${core.peersOnline().joinToString(",") { "\"${it.value}\"" }}],")
        append("\"delivered\":${delivered.size},")
        append("\"acks\":${acks.get()},")
        append("\"held\":${core.store.totalHeld()},")
        append("\"metrics\":${metrics.size}")
        append("}")
    }

    /** G2-E / T5: relay dies — sockets drop, DTN store survives in-process. */
    fun die() {
        transports.forEach { it.close() }
        transports.clear()
        server?.close()
        // ctl stays up so /rise can reach us
    }

    fun rise() {
        if (goMode) server = TcpTransport.serve(port) { t -> transports.add(t); core.attach(t) }
    }

    companion object {
        @JvmStatic
        fun main(args: Array<String>) {
            val a = args.toMutableList()
            fun opt(n: String): String? { val i = a.indexOf(n); return if (i >= 0 && i + 1 < a.size) a.removeAt(i + 1).also { a.removeAt(i) } else null }
            val id = opt("--id") ?: "AAAA"
            val go = "--go" in a
            val port = opt("--port")?.toInt() ?: 8988
            val ctl = opt("--ctl")?.toInt() ?: port + 1
            val phone = SimulatedPhone(EdgeId(id), go, port, ctl)
            phone.start()
            // keep JVM alive
            Thread.currentThread().join()
        }
    }
}
