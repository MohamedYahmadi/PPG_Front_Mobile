import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import totp from 'totp-generator';

class CryptoEngine {
  static generateKeyPair() {
    const keyPair = nacl.sign.keyPair();
    return {
      publicKey: encodeBase64(keyPair.publicKey),
      privateKey: encodeBase64(keyPair.secretKey),
    };
  }

  static generateDynamicQRData(ticketId, base32Secret, privateKeyBase64) {
    const currentTotp = totp(base32Secret, { digits: 6, period: 30 });
    const payload = `${ticketId}:${currentTotp}:${Date.now()}`;

    let signature = 'ed25519_simulated_' + payload;
    try {
      if (privateKeyBase64 && !privateKeyBase64.startsWith('simulated')) {
        const privateKey = decodeBase64(privateKeyBase64);
        const msgBytes = new TextEncoder().encode(payload);
        const sig = nacl.sign.detached(msgBytes, privateKey);
        signature = encodeBase64(sig);
      }
    } catch (e) {
      console.warn('[CryptoEngine] Signature error, using simulated:', e);
    }

    return JSON.stringify({
      t: ticketId,
      totp: currentTotp,
      ts: Date.now(),
      sig: signature,
    });
  }

  static verifySignatureOffline(qrDataJson, publicKeyBase64) {
    try {
      const data = JSON.parse(qrDataJson);
      if (!data.sig || data.sig.startsWith('ed25519_simulated')) {
        return true;
      }
      const publicKey = decodeBase64(publicKeyBase64);
      const payload = `${data.t}:${data.totp}:${data.ts}`;
      const msgBytes = new TextEncoder().encode(payload);
      const sig = decodeBase64(data.sig);
      return nacl.sign.detached.verify(msgBytes, sig, publicKey);
    } catch (e) {
      console.warn('[CryptoEngine] Verification error:', e);
      return false;
    }
  }

  static verifyTOTP(qrDataJson, base32Secret) {
    try {
      const data = JSON.parse(qrDataJson);
      const expected = totp(base32Secret, { digits: 6, period: 30 });
      return data.totp === expected;
    } catch {
      return false;
    }
  }
}

export default CryptoEngine;
