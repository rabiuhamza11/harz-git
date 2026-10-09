# LEG 2 REHEARSAL — TORN WRITE DEATH TEST (Oct 7, 2026)
Interrupt mechanism: kernel RLIMIT_FSIZE (ulimit -f 2). The kernel cuts the record line mid-byte-stream and the writer cannot complete. No fabricated files, no editor, no manual repair.
Sequence: seal#1 (740B) -> long seal 8KB under limit -> line cut at 2048B (1308B fragment, no newline, mid-JSON) -> fresh process read -> quarantine -> continue.
VERDICT vs Dad's pass conditions: ALL HELD.
1. existing #1 intact: SEALS 1 CHAIN INTACT (re-verified from disk)
2. incomplete tail quarantined: seals.torn, timestamped, never erased
3. no phantom record: torn fragment never became a record
4. chain re-verified from disk: CHAIN INTACT
5. subsequent writes continued: SEALED #2 (new), 2 records CHAIN INTACT
6. no manual repair: only the kernel limit and the node acted
FINDING F-LEG2-1 (real, ruling pending, unpatched): THE LYING ACK.
Node writeSync returns a SILENT SHORT WRITE when the kernel cuts the line;
appendDurable does not check bytesWritten, fsyncs the fragment, and prints
"SEALED #2 ... fsynced to disk BEFORE this ack" for a record that was only
1308 of ~2111 bytes on disk. After the fresh-process read the record is gone
(quarantined); the next seal reuses seq 2 with a different link.
Real-world trigger: storage exhaustion (ENOSPC) on a phone. R1 wound: ACK
issued for a non-durable record. Root cause: writeSync return value unchecked.
