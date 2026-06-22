import { BRCODE_CRC_LENGTH, BRCODE_CRC_TAG } from './constants.js';

/** CRC16-CCITT-FALSE — polynomial 0x1021, initial 0xFFFF (Bacen Manual BR Code). */
export function computeCrc16Ccitt(payload: string): string {
  let crc = 0xffff;

  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(BRCODE_CRC_LENGTH, '0');
}

export function verifyBrCodeCrc(payload: string): { ok: true } | { ok: false; message: string } {
  if (payload.length < BRCODE_CRC_LENGTH + 4) {
    return { ok: false, message: 'BR Code payload is too short for CRC validation' };
  }

  const providedCrc = payload.slice(-BRCODE_CRC_LENGTH);
  if (!/^[0-9A-Fa-f]{4}$/.test(providedCrc)) {
    return { ok: false, message: 'BR Code CRC must be 4 hexadecimal characters' };
  }

  const body = payload.slice(0, -BRCODE_CRC_LENGTH);
  if (!body.endsWith(`${BRCODE_CRC_TAG}${String(BRCODE_CRC_LENGTH).padStart(2, '0')}`)) {
    return { ok: false, message: 'BR Code payload must end with CRC tag 63 before checksum' };
  }

  const expected = computeCrc16Ccitt(body);
  if (providedCrc.toUpperCase() !== expected) {
    return { ok: false, message: 'BR Code CRC16-CCITT checksum is invalid' };
  }

  return { ok: true };
}
