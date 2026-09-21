package com.harz.edgetelecom.radio

import android.content.Context
import android.net.wifi.WifiManager
import android.net.wifi.p2p.WifiP2pConfig
import android.net.wifi.p2p.WifiP2pDevice
import android.net.wifi.p2p.WifiP2pDeviceList
import android.net.wifi.p2p.WifiP2pInfo
import android.net.wifi.p2p.WifiP2pManager
import com.harz.edgetelecom.mesh.EdgeId
import com.harz.edgetelecom.mesh.MeshFrame
import com.harz.edgetelecom.mesh.MeshProtocol
import com.harz.edgetelecom.mesh.Transport
import java.io.DataInputStream
import java.io.DataOutputStream
import java.net.InetAddress
import java.net.ServerSocket
import java.net.Socket
import java.util.concurrent.atomic.AtomicBoolean

/**
 * WifiDirectManager — primary radio of the v2.x app family.
 * GO (group owner) runs a ServerSocket on :8988 (frozen protocol port);
 * clients connect to the GO address and register via HELLO (magic 0x48415A5A).
 * Rebuilt per the frozen spec: GO initiation trap, auto-recovery, and the
 * store-and-forward flush path all flow through MeshCore — this class is
 * transport ONLY.
 */
class WifiDirectManager(private val ctx: Context) {
    private val p2p = ctx.getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
    private var channel: WifiP2pManager.Channel? = null
    private var goServer: ServerSocket? = null
    val discovered = mutableListOf<WifiP2pDevice>()

    fun initialize() {
        channel = p2p?.initialize(ctx, ctx.mainLooper, null)
    }

    fun discoverPeers(onResult: (List<WifiP2pDevice>) -> Unit) {
        p2p?.discoverPeers(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {}
            override fun onFailure(reason: Int) {}
        })
        // DEVICE_FOUND broadcasts fill `discovered` via the app's receiver.
    }

    fun connect(device: WifiP2pDevice, onConnected: (WifiP2pInfo) -> Unit) {
        val config = WifiP2pConfig().apply { deviceAddress = device.deviceAddress }
        p2p?.connect(channel, config, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {} // CONNECTION_CHANGED broadcast carries WifiP2pInfo
            override fun onFailure(reason: Int) {}
        })
    }

    /** Start the GO socket server — phone-as-server (EdgeServer rail). */
    fun startGoServer(onClient: (Transport) -> Unit): Boolean = try {
        goServer = ServerSocket(MeshProtocol.PORT_GO)
        Thread {
            while (goServer?.isClosed == false) {
                val s = try { goServer?.accept() } catch (e: Exception) { break } ?: break
                onClient(WifiDirectTransport(s))
            }
        }.apply { name = "wdm-go-8988"; start() }
        true
    } catch (e: Exception) { false }

    fun stopGoServer() { goServer?.close(); goServer = null }

    /** Client connects to the GO. */
    fun connectToGroupOwner(goAddress: InetAddress): Transport? = try {
        WifiDirectTransport(Socket(goAddress, MeshProtocol.PORT_GO).apply { tcpNoDelay = true })
    } catch (e: Exception) { null }

    /** Transport over a live Wi-Fi Direct socket — same framing as TcpTransport. */
    class WifiDirectTransport(private val socket: Socket) : Transport {
        private val connected = AtomicBoolean(true)
        private var handler: ((ByteArray) -> Unit)? = null
        private val out = DataOutputStream(socket.getOutputStream())
        private val inp = DataInputStream(socket.getInputStream())

        override fun send(bytes: ByteArray) {
            try { synchronized(out) { out.writeInt(bytes.size); out.write(bytes); out.flush() } }
            catch (e: Exception) { connected.set(false) }
        }

        override fun onFrame(h: (ByteArray) -> Unit) {
            handler = h
            Thread {
                try {
                    while (connected.get()) {
                        val len = inp.readInt()
                        val buf = ByteArray(len)
                        inp.readFully(buf)
                        handler?.invoke(buf)
                    }
                } catch (e: Exception) { connected.set(false) }
            }.apply { name = "wdm-reader"; start() }
        }

        override fun isConnected(): Boolean = connected.get() && !socket.isClosed
        override fun describe(): String = "wifi-direct://${socket.remoteSocketAddress}"
        fun close() { connected.set(false); try { socket.close() } catch (_: Exception) {} }
    }
}
