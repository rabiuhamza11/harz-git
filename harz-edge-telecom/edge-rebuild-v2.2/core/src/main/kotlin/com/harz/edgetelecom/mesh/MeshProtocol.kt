package com.harz.edgetelecom.mesh

/**
 * HARZ Edge Telecom — Mesh protocol constants.
 * Rebuilt from the frozen G1/G2 field protocol (v1.0) after the loss of the v2.1 sources.
 * Wire values match the Sep 6 logic-layer validation report:
 *   - HELLO handshake with magic 0x48415A5A ("HAZZ") + edge-ID registration
 *   - GO (group owner) runs a ServerSocket on port 8988
 *   - frames carry seq, TTL, hop count, route list
 *   - MediaTek/device profile: 900-byte chunks, 20 ms pacing
 */
object MeshProtocol {
    /** HELLO magic — "HAZZ" as big-endian u32. */
    const val MAGIC: Int = 0x48415A5A
    const val PORT_GO: Int = 8988

    /** Default payload chunk size (bytes). Media-profile uses the same value. */
    const val CHUNK_SIZE: Int = 900

    /** Inter-chunk pacing (ms) — protects low-end radios and 2 GB phones. */
    const val CHUNK_PACING_MS: Long = 20

    /** Default TTL for new data frames. */
    const val DEFAULT_TTL: Int = 8

    /** Route list capacity guard — prevents runaway route growth. */
    const val MAX_ROUTE: Int = 16

    /** Frame types. */
    const val TYPE_HELLO: Int = 0x01     // edge-ID registration on connect
    const val TYPE_HELLO_ACK: Int = 0x02 // GO answers with its own edge-ID
    const val TYPE_DATA: Int = 0x03      // user payload chunk (one seq per chunk)
    const val TYPE_ACK: Int = 0x04       // per-chunk delivery ACK (returns along route)
    const val TYPE_BYE: Int = 0x05       // graceful disconnect

    /**
     * G2-C frozen rule (TTL semantics):
     *   TTL 0  -> deliver locally, NEVER forward
     *   TTL 1  -> deliver locally at the relay, do NOT forward onward
     *   TTL >=2-> may traverse (forward as TTL-1, hops+1, route+self)
     * Indefinite circulation = integrity failure. Enforced in MeshCore.
     */
    object Ttl {
        const val NO_FORWARD: Int = 0
        const val STOP_AT_RELAY: Int = 1
    }
}
