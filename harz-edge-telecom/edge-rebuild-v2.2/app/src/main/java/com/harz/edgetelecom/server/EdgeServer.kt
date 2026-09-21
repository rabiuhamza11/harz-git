package com.harz.edgetelecom.server

import com.harz.edgetelecom.mesh.MeshProtocol
import com.harz.edgetelecom.radio.WifiDirectManager
import java.net.ServerSocket

/**
 * EdgeServer — phone-as-server rail (frozen spec).
 * The GO phone runs this whenever it is group owner: Wi-Fi Direct GO with
 * a ServerSocket on :8988. No cloud, no internet, no servers required for
 * local operation.
 */
class EdgeServer(private val radio: WifiDirectManager) {
    private var running = false

    fun start(onClient: (com.harz.edgetelecom.mesh.Transport) -> Unit): Boolean {
        if (running) return true
        running = radio.startGoServer(onClient)
        return running
    }

    fun stop() {
        radio.stopGoServer()
        running = false
    }

    fun port(): Int = MeshProtocol.PORT_GO
}
