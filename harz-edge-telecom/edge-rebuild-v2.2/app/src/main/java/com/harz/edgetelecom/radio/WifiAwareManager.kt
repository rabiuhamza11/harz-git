package com.harz.edgetelecom.radio

import android.content.Context
import android.net.wifi.aware.AttachCallback
import android.net.wifi.aware.WifiAwareManager
import android.net.wifi.aware.WifiAwareSession
import android.os.Build

/**
 * WifiAwareManager — capability probe + transport candidate (G1-A).
 * Per the frozen report: Wi-Fi Aware is UNAVAILABLE on the Tecno/MediaTek
 * class. That is a recorded finding, never a failure — RadioController
 * falls back to Wi-Fi Direct.
 */
class WifiAwareManager(private val ctx: Context) {
    private var session: WifiAwareSession? = null

    fun isAvailable(): Boolean =
        Build.VERSION.SDK_INT >= 26 && ctx.getSystemService(Context.WIFI_AWARE_SERVICE) is WifiAwareManager

    fun attach(onAttached: (WifiAwareSession) -> Unit, onUnavailable: (String) -> Unit) {
        val mgr = ctx.getSystemService(Context.WIFI_AWARE_SERVICE) as? WifiAwareManager
        if (mgr == null) { onUnavailable("no-service"); return }
        mgr.attach(object : AttachCallback() {
            override fun onAttached(s: WifiAwareSession) { session = s; onAttached(s) }
            override fun onAttachFailed() { onUnavailable("attach-failed") }
        }, null)
    }
}
