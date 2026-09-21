# BUILD RECEIPT — HARZ Edge Telecom v2.2.0-rebuild1 APK (compiled Sep 16, 2026)

## Deliverable
- APK: 860,262 bytes (860 KB)
- MD5: d9e8b72d45d4b614cc46ffc5ec777cbe
- SHA256: d26acbe5a1e2ac7fd75c5efe2acf380085f830a3e6c9a82f9d9649bfa7a37c08
- Delivered to: HARZ_FILES KV (namespace 446c0389e11440d9b730ea6f472e8c7f)
- KV key: d9e8b72d45d4b614cc46ffc5ec777cbe-HARZ-Edge-Telecom-v2.2.0-rebuild1.apk
- KV read-back: byte-identical (md5 match verified)
- Signing: debug key (Android Debug cert, standard for field-test install on 3 phones).
  Signer SHA-256: 08284ad744fd04ec620a955600ae96bc0cc9f9993682d0fa63c33c5330bb812a
- Package: com.harz.edgetelecom, versionCode 4 (v2.1.0-fieldready was 3), versionName 2.2.0-rebuild1
- minSdk 26, targetSdk 34, label "HARZ Edge Telecom"

## Source provenance
Base: HarzGit commit 12b599151644e298a5ce8398a8c2a05d12531596 (Edge rebuild v2.2.0-rebuild1,
26 files, committed Sep 14 07:55 UTC) + THIS commit's build scaffolding and compile fixes.
Pre-build proof: core-selftest.jar run on JVM — 20/20 PASS (all-pass battery preserved
before compile). Core module: pure JVM, zero Android imports.

## What this build commit adds (the commit shipped no gradle files)
1. Gradle scaffolding: settings.gradle, root build.gradle (AGP 8.4.2, Kotlin 1.9.23),
   core/build.gradle (JVM 17), app/build.gradle (compileSdk 34, minSdk 26).
2. Launcher icon resources (manifest referenced @mipmap/ic_launcher but no icon was
   committed): mipmap-anydpi-v26/ic_launcher.xml + vector drawable + color (light #f0f2f5).
3. THREE compile fixes in app/.../trust/IdentityManager.kt — the file was never compiled
   before (the JVM battery covers core/ only), and it did not compile as committed:
   - line 27: KeyProperties.KEY_ALGORITHM_ED25519 does not exist in any public Android
     API through 34 (verified against android.jar) — replaced with the string literal
     "Ed25519" (identical value/behavior; AndroidKeyStore Ed25519 is API 33+ anyway,
     and every path in this class is try/catch-guarded for older phones).
   - lines 38/45: publicKeyHex() and sign() used `return null` inside expression-body
     functions (illegal Kotlin) — converted to block bodies, logic byte-for-byte same.

## Build environment (reproducible)
- Temurin JDK 17.0.12+7, Gradle 8.7, Android SDK: platforms;android-34, build-tools;34.0.0
- All toolchain downloads over HTTPS (sandbox blocks non-443)
- BUILD SUCCESSFUL :app:assembleDebug

## Protocol version note (per desk's request)
Wire protocol: v2.2 data plane, magic u32 0x48415A5A (PROTOCOL-WIRE.md unchanged).
App version 2.2.0-rebuild1 = candidate, NOT field-ready. Per the frozen acceptance gate:
the desk's independent harness run + freeze ceremony assigns the official protocol
freeze number and md5. This receipt's md5 is the BUILD artifact identity only.

## Verification performed
- apksigner verify: exit 0
- aapt badging: package/version/minSdk/label confirmed
- APK binary secret sweep: clean (no tokens, no key material)
- Source secret scan pre-build: clean
- KV upload read-back: md5 match True

## Honest notes for the desk
- No res/ layouts existed; UI is programmatic (light #f0f2f5, no webviews) — no missing
  resource work was skipped, only the icon the manifest demanded was added.
- CryptoManager (ChaCha20-Poly1305) is used by app layer; keystore Ed25519 identity
  requires API 33+ at RUNTIME (Infinix Hot 10i runs older) — IdentityManager fails
  closed (false/null) there; the field test should expect Edge-ID signing to report
  unavailable on sub-33 devices unless the harness covers that path. This is inherited
  from the committed source, not a build artifact.
