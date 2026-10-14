# BRIDGE VERIFICATION REFERENCE (Oct 14, ~07:30 WAT, from the seat holding the remote-connected clone)

## Step 0 finding (changes the bridge problem)
The shared repository github.com/rabiuhamza11/harz-git is PUBLIC:
- anonymous HTTPS: HTTP 200
- GitHub API reports visibility: public
=> READ ACCESS REQUIRES NO CREDENTIAL GRANT. The desk can fetch main
anonymously right now. Push (write) access still requires an owner-issued
token. Owner may of course flip visibility to private (owner action);
if he does, a read credential then becomes necessary for the bridge.

## Desk-side commands (read-only, no merge/rebase/reset)
git remote -v
git status --short --branch
git ls-remote https://github.com/rabiuhamza11/harz-git refs/heads/main
git fetch origin main   (or: git clone https://github.com/rabiuhamza11/harz-git)
git rev-parse origin/main
git show -s --format='%H %P %s' origin/main

## Expected reference values (published for comparison; verification happens
on the desk's machine against fetched objects — relay values are references,
not proofs)
- origin/main: d5174de4fc315b84e78e430fb0005cf48a902a63
- Stage 2 toolchain handoff (parent = evidence package):
  1b33938c51fea39bdc065cd1a6e0fe3fc212eba6
  parent 897ffe1a828baafbb5ac3d8d5227c91f66eb72ae
- Evidence package (parent = v0.3 pipeline):
  897ffe1a828baafbb5ac3d8d5227c91f66eb72ae
  parent c4d41d887ece1a05fcd4dfc1d8268b11548291f6
- v0.3 pipeline:
  c4d41d887ece1a05fcd4dfc1d8268b11548291f6
  parent 27cc9103d3cafef48ec58ee7119c19b92086696d

## Artifact integrity (separate from commit identity)
stage2-toolkit/SHA256-RECEIPTS.txt full sha256:
5e5fb94426932c7a2256873ea22f722ec236dbe94e2b1c65b25298e58cdf45e5
contents (file-level sha256s):
d4c1d511d45986e5  stage2-compress.py
7ab3371393fe22fc  stage2-dedup.py
1109c98745c59ade  stage2-compression-receipt-compress.json
196b06c992e4a5c8  stage2-dedup-receipt.json

## Standing state (unchanged)
HOLD remains: 12,722 quarantined docs untouched; stubbed WAVE untouched; no
purge, release, rebuild, or freeze relaxation. Desk's 346d884 remains
declared-unverified until fetchable.
