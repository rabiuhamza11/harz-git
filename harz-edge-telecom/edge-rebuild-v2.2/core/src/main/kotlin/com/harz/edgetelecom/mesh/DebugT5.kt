package com.harz.edgetelecom.mesh

object DebugT5 {
    private fun phone(id: String, go: Boolean, port: Int): SimulatedPhone =
        SimulatedPhone(EdgeId(id), go, port, port + 100).also { it.start() }

    private fun waitPeers(p: SimulatedPhone, n: Int) {
        val t0 = System.currentTimeMillis()
        while (p.core.peersOnline().size < n && System.currentTimeMillis() - t0 < 5000) Thread.sleep(25)
    }

    @JvmStatic
    fun main(args: Array<String>) {
        val b = phone("BBBB", true, 9160)
        val a = phone("AAAA", false, 9162)
        val c = phone("CCCC", false, 9164)
        a.connect("127.0.0.1", 9160)
        c.connect("127.0.0.1", 9160)
        waitPeers(b, 2); waitPeers(a, 1); waitPeers(c, 1)
        println("PHASE0 peers: A=${a.core.peersOnline()} B=${b.core.peersOnline()} C=${c.core.peersOnline()}")
        a.sendBurst(EdgeId("CCCC"), 10, 900, 8, 0, "warm")
        Thread.sleep(1500)
        println("PHASE1 warm delivered C=${c.delivered.size} acksA=${a.acks.get()}")
        b.die()
        Thread.sleep(600)
        println("PHASE2 after die: A peers=${a.core.peersOnline()} A transports=${a.transports.map { it.isConnected() }} C peers=${c.core.peersOnline()}")
        a.sendBurst(EdgeId("CCCC"), 20, 900, 8, 0, "outage")
        Thread.sleep(400)
        println("PHASE3 held at A=${a.core.store.totalHeld()}")
        b.rise()
        a.connect("127.0.0.1", 9160)
        c.connect("127.0.0.1", 9160)
        Thread.sleep(3000)
        println("PHASE4 after reconnect: A peers=${a.core.peersOnline()} B peers=${b.core.peersOnline()} C peers=${c.core.peersOnline()}")
        println("PHASE4 A held=${a.core.store.totalHeld()} B held=${b.core.store.totalHeld()} C delivered=${c.delivered.size} A acks=${a.acks.get()}")
        println("--- A metrics ---"); a.metrics.forEach { println(it) }
        println("--- B metrics ---"); b.metrics.forEach { println(it) }
        println("--- C metrics ---"); c.metrics.forEach { println(it) }
    }
}
