package com.harz.edgetelecom.mesh

/**
 * Transport abstraction — one edge connection to a peer.
 * The SAME MeshCore runs over:
 *   - TcpTransport      (JVM harness adapter — the desk's acceptance path)
 *   - WifiDirectManager (Android, GO ServerSocket :8988 / client socket)
 *   - WifiAwareManager  (Android, Wi-Fi Aware — availability recorded per G1-A)
 *   - BleManager        (Android, BLE GATT fallback)
 * Radio reality is G1's job; the core stays radio-agnostic by design.
 */
interface Transport {
    /** Send raw frame bytes to this peer. */
    fun send(bytes: ByteArray)
    /** Register the frame receiver for this peer's data. */
    fun onFrame(handler: (ByteArray) -> Unit)
    /** Peer present? GO/client socket still connected. */
    fun isConnected(): Boolean
    /** Human-readable peer description for metrics. */
    fun describe(): String
}
