# LEG 2 WORKBENCH VERDICT — CLOSED (Oct 7, 2026, ~21:15 WAT)
Battery on frozen v0.3 (98dcdd624a49), real processes, kernel file-size law as the interrupt.
R1 baseline: 1 record CHAIN INTACT.
R2 interrupted persistence: line cut at 2048B cap -> LYING ACK "SEALED #2 d8b7604b" (F-LEG2-1).
R3 torn artifact on disk: 1304B fragment, mid-JSON, no newline.
R4 SIGKILL boundary: process kill cannot tear a single write — only the kernel size law or real power death tears. Node self-healed the tail during seal's internal read (quarantine, silent).
R5 fresh process disk truth: 2 records CHAIN INTACT (healed).
R6 continue writing: SECOND torn cut -> SECOND LYING ACK "SEALED #3 20686607" -> quarantined -> chain stays 2 INTACT. F-LEG2-1 reproduced twice.
R7 quarantine evidence: seals.torn timestamped, never erased.
R8 durability: 2 records INTACT across fresh processes.
DAD'S PASS CONDITIONS: ALL HELD. existing intact / tail quarantined / no phantom / re-verify from disk / writes continue / no manual repair.
OPEN WOUND (unpatched, ruling pending): F-LEG2-1 THE LYING ACK — writeSync short write unchecked; fsync of fragment + false "fsynced BEFORE this ack" receipt; real-world trigger ENOSPC.
Physical power-off during torn write remains optional field homework (LEG 1 already proved real device death). Workbench verdict is the honest substitute for the disk/kernel mechanics; power death survival is already evidenced.
