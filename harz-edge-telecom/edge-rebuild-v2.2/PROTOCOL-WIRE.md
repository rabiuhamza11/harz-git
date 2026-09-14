# HARZ-Mesh wire format — rebuilt v2.2 data plane

For the desk's independent harness adaptation. All integers big-endian.

## Frame (MeshFrame)
magic u32 = 0x48415A5A | type u8 | src 4B | dst 4B | seq u32 | ttl u8 |
hops u8 | routeLen u8 | route (routeLen x 4B) | sigLen u8 | sig | payLen u32 |
payload | crc32 u32 (CRC32 over all preceding bytes)

Types: HELLO=0x01, HELLO_ACK=0x02, DATA=0x03, ACK=0x04, BYE=0x05.
Edge IDs: exactly 4 printable ASCII bytes (AAAA, BBBB, TCS1, ...).
HELLO/BYE dst = 4 spaces (broadcast sentinel, printable by design).
sigLen = 0 at the logic layer (G1/G2 runs are unsigned; Ed25519 activates
in the app build, sigLen 64).

## Socket framing
Length-prefixed: u32 len + frame bytes. GO ServerSocket listens on :8988.

## Semantics (frozen)
HELLO: client registers edge-ID; GO replies HELLO_ACK with its own edge-ID.
DATA: route starts [src]; each forwarder appends itself, ttl-1, hops+1.
Receiver ACKs each delivered chunk: src=receiver, dst=original sender,
seq echoed, route = the route the DATA arrived with.
TTL (G2-C): ttl 0 never forwarded; ttl 1 stops at the relay; ttl>=2 traverses.
Dedup: (src,seq) exactly-once at every node (LRU 4096).
Store-and-forward: frames for unreachable peers are held UNMODIFIED and
flushed byte-identical on the peer's return (re-registration flushes the
store — this was the one real bug found and fixed in the rebuild).
Chunking: 900-byte chunks, 20 ms pacing. NO retransmit in the data plane
(frozen rule: loss is counted honestly without rescue).

## Harness adapter (SimulatedPhone)
GO/relay/receiver: SimulatedPhone --id BBBB --go --port 8988 --ctl 8989
Client: SimulatedPhone --id AAAA --connect 127.0.0.1:8988
Control port: GET /status, GET /metrics, POST /send?dst=CCCC&n=100&size=900&ttl=8&paceMs=20,
POST /connect?to=127.0.0.1:8988, POST /die, POST /rise
