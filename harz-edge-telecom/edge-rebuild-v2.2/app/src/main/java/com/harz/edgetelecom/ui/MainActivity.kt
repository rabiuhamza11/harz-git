package com.harz.edgetelecom.ui

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import com.harz.edgetelecom.mesh.EdgeId
import com.harz.edgetelecom.radio.RadioController
import com.harz.edgetelecom.service.MeshService

/**
 * MainActivity — light theme (#f0f2f5, no dark mode), built for a 2 GB
 * Infinix: zero webviews, zero heavy layouts, programmatic views only.
 * G1/G2 field flow: set edge-ID -> probe radios -> start service -> GO or
 * connect -> run numbered bursts -> export CSV.
 */
class MainActivity : Activity() {
    private lateinit var statusView: TextView
    private lateinit var radio: RadioController

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        radio = RadioController(this)

        val root = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setBackgroundColor(0xfff0f2f5.toInt())
            setPadding(32, 48, 32, 32)
        }

        val title = TextView(this).apply {
            text = "HARZ Edge Telecom"
            textSize = 22f
            setTextColor(0xff0066ff.toInt())
        }
        val idInput = EditText(this).apply { hint = "Edge ID (4 chars, e.g. AAAA)" }
        statusView = TextView(this).apply {
            text = "G1/G2 field build — rebuilt ${'$'}BuildConfig-less: 2.2.0-rebuild1"
            textSize = 12f
            setTextColor(0xff666666.toInt())
        }
        val probeBtn = Button(this).apply {
            text = "Probe radios (G1-A)"
            setOnClickListener {
                val r = radio.probe()
                statusView.text = "Aware=${r.awareAvailable} Direct=${r.directAvailable} BLE=${r.bleAvailable}\nChosen: ${r.chosen}"
            }
        }
        val startBtn = Button(this).apply {
            text = "Start mesh service"
            setOnClickListener {
                val id = idInput.text.toString().trim()
                if (id.length != 4) { Toast.makeText(this@MainActivity, "Edge ID must be 4 chars", Toast.LENGTH_SHORT).show(); return@setOnClickListener }
                val svc = Intent(this@MainActivity, MeshService::class.java).putExtra("edge_id", id)
                startForegroundService(svc)
                statusView.text = "Mesh running as $id. GO flow: accept :8988. Client flow: connect to GO."
            }
        }
        val csvBtn = Button(this).apply {
            text = "Export metrics CSV"
            setOnClickListener {
                MeshService.metrics?.let { m ->
                    val f = m.flushToFile("g1g2-${System.currentTimeMillis()}.csv")
                    Toast.makeText(this@MainActivity, "CSV: ${f.name}", Toast.LENGTH_LONG).show()
                }
            }
        }

        root.addView(title)
        root.addView(idInput)
        root.addView(probeBtn)
        root.addView(startBtn)
        root.addView(csvBtn)
        root.addView(statusView)
        setContentView(root)
    }
}
