package com.harz.edgetelecom.mesh

/**
 * Store-and-forward (DTN) message store — frozen G2-E behavior:
 * when a relay drops mid-run, frames for unreachable peers are held,
 * then flushed BYTE-IDENTICAL on the peer's return.
 * Held frames keep their original seq/ttl/hops/route — the store never
 * rewrites payload or sequencing (byte-identical flush is the acceptance rule).
 */
class StoreAndForward(private val maxHeld: Int = 1024) {
    private val held = LinkedHashMap<String, MutableList<MeshFrame>>()

    @Synchronized
    fun hold(dst: EdgeId, frame: MeshFrame) {
        if (totalHeld() >= maxHeld) return // drop, never rescue: loss is counted honestly
        held.getOrPut(dst.value) { mutableListOf() }.add(frame)
    }

    @Synchronized
    fun drain(dst: EdgeId): List<MeshFrame> = drainKey(dst.value)

    @Synchronized
    fun drainKey(key: String): List<MeshFrame> = held.remove(key) ?: emptyList()

    @Synchronized
    fun totalHeld(): Int = held.values.sumOf { it.size }

    @Synchronized
    fun heldFor(dst: EdgeId): Int = held[dst.value]?.size ?: 0

    /** Snapshot of destination keys with held frames (for relay-flush logic). */
    @Synchronized
    fun heldSnapshot(): Map<String, List<MeshFrame>> = held.mapValues { ArrayList<MeshFrame>(it.value) }
}
