package com.harz.edgetelecom.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import com.harz.edgetelecom.mesh.EdgeId
import com.harz.edgetelecom.mesh.MeshCore
import com.harz.edgetelecom.metrics.TestMetricsCollector
import java.io.File

/**
 * MeshService — foreground service that owns the radio + MeshCore runtime.
 * Battery guard: wakelock held only while an active transfer runs;
 * the caller keeps Termux-class battery discipline (Unrestricted) per
 * the standing ecosystem rule for long runs.
 */
class MeshService : Service() {
    companion object {
        var core: MeshCore? = null
        var metrics: TestMetricsCollector? = null
        const val CHANNEL_ID = "harz_mesh"
    }

    override fun onCreate() {
        super.onCreate()
        val nm = getSystemService(NOTIFICATION_SERVICE) as NotificationManager
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL_ID, "HARZ Mesh", NotificationManager.IMPORTANCE_LOW)
        )
        startForeground(1, Notification.Builder(this, CHANNEL_ID)
            .setContentTitle("HARZ Edge Telecom")
            .setContentText("Mesh node running — G1/G2 test mode")
            .setSmallIcon(android.R.drawable.stat_sys_data_bluetooth)
            .build())
        metrics = TestMetricsCollector(File(filesDir, "mesh-metrics"))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val edgeId = intent?.getStringExtra("edge_id")?.let { runCatching { EdgeId(it) }.getOrNull() } ?: EdgeId("PHN0")
        if (core == null) {
            core = MeshCore(edgeId, object : MeshCore.Listener {
                override fun onData(src: EdgeId, seq: Long, hops: Int, route: List<EdgeId>, payload: ByteArray) {
                    metrics?.event("data", "src=${src.value},seq=$seq,hops=$hops,route=${route.joinToString(">") { it.value }}")
                }
                override fun onAck(src: EdgeId, seq: Long) { metrics?.event("ack", "src=${src.value},seq=$seq") }
                override fun onPeerJoined(peer: EdgeId, via: String) { metrics?.event("peer_joined", "${peer.value},$via") }
                override fun onPeerLost(peer: EdgeId) { metrics?.event("peer_lost", peer.value) }
                override fun onMetric(event: String, detail: String) { metrics?.event(event, detail) }
            })
        }
        return START_STICKY
    }

    override fun onDestroy() {
        core = null
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
