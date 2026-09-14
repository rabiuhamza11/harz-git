package com.harz.edgetelecom.trust

import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec
import java.security.SecureRandom

/**
 * CryptoManager — ChaCha20-Poly1305 (frozen spec).
 * Android provides ChaCha20-Poly1305 via the default JCA provider.
 * Key is derived per session from ECDH over the two phones' Ed25519-anchored
 * identity keys; this module only performs the AEAD itself.
 */
class CryptoManager {
    private val rnd = SecureRandom()

    fun encrypt(key: ByteArray, plaintext: ByteArray): Pair<ByteArray, ByteArray> {
        val nonce = ByteArray(12).also { rnd.nextBytes(it) }
        val cipher = Cipher.getInstance("ChaCha20-Poly1305")
        cipher.init(Cipher.ENCRYPT_MODE, SecretKeySpec(key, "ChaCha20"), GCMParameterSpec(128, nonce))
        return nonce to cipher.doFinal(plaintext)
    }

    fun decrypt(key: ByteArray, nonce: ByteArray, ciphertext: ByteArray): ByteArray? = try {
        val cipher = Cipher.getInstance("ChaCha20-Poly1305")
        cipher.init(Cipher.DECRYPT_MODE, SecretKeySpec(key, "ChaCha20"), GCMParameterSpec(128, nonce))
        cipher.doFinal(ciphertext)
    } catch (e: Exception) { null }
}
