package com.harz.edgetelecom.metrics

import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * TestMetricsCollector — raw CSV for G1/G2 (frozen artifact requirement).
 * Columns cover every gate: link quality, delivery, battery/hour, route
 * changes, recovery, TTL stops, dedup drops, held/flush counts.
 */
class TestMetricsCollector(private val dir: File) {
    private val fmt = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS", Locale.US)
    private val rows = mutableListOf<String>()

    init {
        dir.mkdirs()
    }

    fun event(kind: String, detail: String) {
        rows.add("${fmt.format(Date())},$kind,$detail")
    }

    /** Raw CSV artifact — required for any gate classification. */
    fun flushToFile(name: String): File {
        val f = File(dir, name)
        f.writeText(CSV_HEADER + rows.joinToString("\n") + "\n")
        return f
    }

    companion object {
        const val CSV_HEADER = "timestamp,kind,detail\n"
    }
}
