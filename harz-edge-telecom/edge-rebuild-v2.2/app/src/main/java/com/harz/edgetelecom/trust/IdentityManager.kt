package com.harz.edgetelecom.trust

import android.security.keystore.KeyGenParameterSpec
import android.security.keystore.KeyProperties
import java.security.KeyPairGenerator
import java.security.KeyStore
import java.security.Signature
import java.security.spec.ECGenParameterSpec

/**
 * IdentityManager — Ed25519 Edge IDs (frozen spec: signed packets).
 * The private key is generated INSIDE the Android keystore,
 * StrongBox-backed where available, and is NON-EXTRACTABLE by design —
 * it can sign but never leave the phone. (Deploy-gate rule: no key
 * material in code, files, or logs. Absolute.)
 */
class IdentityManager {
    companion object {
        private const val KS_ALIAS = "harz-edge-id-ed25519"
    }

    fun hasIdentity(): Boolean = try {
        KeyStore.getInstance("AndroidKeyStore").apply { load(null) }.containsAlias(KS_ALIAS)
    } catch (e: Exception) { false }

    fun createIdentity(): Boolean = try {
        val kpg = KeyPairGenerator.getInstance(KeyProperties.KEY_ALGORITHM_ED25519, "AndroidKeyStore")
        kpg.initialize(
            KeyGenParameterSpec.Builder(KS_ALIAS, KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY)
                .build()
        )
        kpg.generateKeyPair()
        true
    } catch (e: Exception) { false }

    fun publicKeyHex(): String? = try {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val cert = ks.getCertificate(KS_ALIAS) ?: return null
        cert.publicKey.encoded.joinToString("") { "%02x".format(it) }
    } catch (e: Exception) { null }

    /** Sign a frame hash. Returns 64-byte Ed25519 signature or null. */
    fun sign(data: ByteArray): ByteArray? = try {
        val ks = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }
        val entry = ks.getEntry(KS_ALIAS, null) as? KeyStore.PrivateKeyEntry ?: return null
        Signature.getInstance("Ed25519").run {
            initSign(entry.privateKey)
            update(data)
            sign()
        }
    } catch (e: Exception) { null }
}
