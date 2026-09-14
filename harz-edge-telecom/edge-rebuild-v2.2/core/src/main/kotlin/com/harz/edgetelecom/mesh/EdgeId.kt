package com.harz.edgetelecom.mesh

/**
 * Edge ID — 4-character mesh identifier (ASCII), e.g. "AAAA", "BBBB", "TCS1".
 * The Sep 6 report shows routes as [A,B] and [TCS1]: 4-char codes on the wire.
 * Validated: exactly 4 ASCII printable bytes.
 */
@JvmInline
value class EdgeId(val value: String) {
    init {
        require(value.length == 4) { "EdgeId must be exactly 4 chars, got '$value'" }
        require(value.all { it.code in 0x20..0x7E }) { "EdgeId must be printable ASCII" }
    }

    fun bytes(): ByteArray = ByteArray(4).also { buf ->
        for (i in 0 until 4) buf[i] = value[i].code.toByte()
    }

    companion object {
        fun fromBytes(b: ByteArray, off: Int = 0): EdgeId {
            require(b.size - off >= 4) { "EdgeId needs 4 bytes" }
            val sb = StringBuilder(4)
            for (i in 0 until 4) sb.append((b[off + i].toInt() and 0xFF).toChar())
            return EdgeId(sb.toString())
        }
    }
}
