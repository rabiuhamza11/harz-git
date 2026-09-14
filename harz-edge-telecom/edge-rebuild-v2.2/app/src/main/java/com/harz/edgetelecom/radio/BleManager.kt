package com.harz.edgetelecom.radio

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.content.Context

/**
 * BleManager — last-resort rail. BLE GATT carries short control frames
 * (HELLO/ACK/discovery), NOT bulk payload — 20-byte MTU chunks make bulk
 * transfer impractical on 2 GB phones. Payload fallback order stays:
 * Direct -> Aware -> BLE-control-plane.
 */
class BleManager(private val ctx: Context) {
    private val adapter: BluetoothAdapter? by lazy {
        (ctx.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager)?.adapter
    }

    @SuppressLint("MissingPermission")
    fun isAvailable(): Boolean = adapter?.isEnabled == true

    fun describe(): String = if (isAvailable()) "ble:ready(${adapter?.name})" else "ble:unavailable"
}
