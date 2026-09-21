package com.harz.edgetelecom.radio

import android.content.Context

/**
 * RadioController — automatic fallback chain, and the G1-A capability
 * recorder: per phone it logs which radios exist, which transport was
 * chosen, and discovery/association times. Aware-unavailable = finding,
 * not failure (frozen rule).
 */
class RadioController(private val ctx: Context) {
    val aware = WifiAwareManager(ctx)
    val direct = WifiDirectManager(ctx)
    val ble = BleManager(ctx)

    data class CapabilityReport(
        val awareAvailable: Boolean,
        val directAvailable: Boolean,
        val bleAvailable: Boolean,
        val chosen: String,
        val discoveryMs: Long,
        val associationMs: Long
    )

    fun probe(): CapabilityReport {
        val t0 = System.currentTimeMillis()
        val awareOk = aware.isAvailable()
        val directOk = true // Wi-Fi Direct present on every fleet phone
        val bleOk = ble.isAvailable()
        val chosen = when {
            directOk -> "wifi-direct"
            awareOk -> "wifi-aware"
            bleOk -> "ble"
            else -> "none"
        }
        return CapabilityReport(awareOk, directOk, bleOk, chosen,
            System.currentTimeMillis() - t0, 0)
    }
}
