package com.harz.edgetelecom.mesh

import java.io.DataInputStream
import java.io.DataOutputStream
import java.io.InputStream
import java.io.OutputStream
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.atomic.AtomicBoolean

/**
 * TcpTransport — JVM transport binding MeshCore to real TCP sockets,
 * the same method as the Sep 6 harness: simulated phones over real sockets.
 * GO (group owner) listens on :8988; clients connect and HELLO.
 *
 * Framing on the stream: 4-byte big-endian length prefix + frame bytes.
 * (The desk's harness speaks the MeshFrame wire format; the length prefix
 * is the socket-level framing so partial reads never desync.)
 */
class TcpTransport(
    private val socket: Socket,
    private val input: InputStream,
    private val output: OutputStream
) : Transport {
    private var handler: ((ByteArray) -> Unit)? = null
    private val connected = AtomicBoolean(true)
    private var reader: Thread? = null

    override fun send(bytes: ByteArray) {
        try {
            synchronized(this) {
                val out = DataOutputStream(output)
                out.writeInt(bytes.size)
                out.write(bytes)
                out.flush()
            }
        } catch (e: Exception) { connected.set(false) }
    }

    override fun onFrame(h: (ByteArray) -> Unit) {
        handler = h
        reader = Thread {
            try {
                val inp = DataInputStream(input)
                while (connected.get()) {
                    val len = inp.readInt()        // frame length prefix
                    val buf = ByteArray(len)
                    inp.readFully(buf)
                    handler?.invoke(buf)
                }
            } catch (e: Exception) {
                connected.set(false)
            }
        }.apply { isDaemon = true; name = "tcp-reader-${socket.remoteSocketAddress}"; start() }
    }

    override fun isConnected(): Boolean = connected.get() && socket.isConnected && !socket.isClosed

    override fun describe(): String = "tcp://${socket.remoteSocketAddress}"

    fun close() { connected.set(false); try { socket.close() } catch (_: Exception) {} }

    companion object {
        /** GO accept loop — returns a started TcpTransport per accepted client. */
        fun serve(port: Int, onClient: (TcpTransport) -> Unit): ServerSocket {
            val server = ServerSocket(port)
            Thread {
                while (!server.isClosed) {
                    val s = try { server.accept() } catch (e: Exception) { break }
                    val t = TcpTransport(s, s.getInputStream(), s.getOutputStream())
                    onClient(t)
                }
            }.apply { isDaemon = true; name = "tcp-accept-$port"; start() }
            return server
        }

        /** Client connect to a GO. */
        fun connect(host: String, port: Int): TcpTransport {
            val s = Socket()
            s.connect(InetSocketAddress(host, port), 10_000)
            s.tcpNoDelay = true
            return TcpTransport(s, s.getInputStream(), s.getOutputStream())
        }
    }
}
