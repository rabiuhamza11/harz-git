package com.harz.edgetelecom.mesh

/**
 * Dedup cache — exactly-once delivery.
 * Key = "src:seq". Duplicates are dropped silently (the Sep 6 harness T4:
 * same packet sent 3x, delivered exactly once; receiver dedup also backs
 * any future retransmit layers).
 * Bounded LRU so the cache cannot grow without limit on a 2 GB phone.
 */
class DedupCache(private val capacity: Int = 4096) {
    private val map = object : LinkedHashMap<String, Unit>(64, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Unit>?): Boolean =
            size > capacity
    }

    @Synchronized
    fun seen(src: EdgeId, seq: Long): Boolean {
        val key = "${src.value}:$seq"
        return if (map.containsKey(key)) true else { map[key] = Unit; false }
    }

    @Synchronized
    fun size(): Int = map.size
}
