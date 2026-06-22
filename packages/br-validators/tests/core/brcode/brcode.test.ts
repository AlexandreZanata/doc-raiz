import { describe, expect, it } from 'vitest';
import {
  BRCODE_GOLDEN_COMPOSITE,
  BRCODE_GOLDEN_STATIC_EMAIL,
  BRCODE_GOLDEN_STATIC_EVP,
  BRCODE_GOLDEN_DYNAMIC_URL,
  BRCODE_GOLDEN_STATIC_CPF,
  BRCODE_OFFICIAL_SOURCE_URL,
  computeCrc16Ccitt,
  findPixMerchantAccount,
  findTlvField,
  isValidBrCode,
  normalizeBrCodePayload,
  parseBrCode,
  parseBrCodePayload,
  parseTlvSequence,
  validateBrCode,
  verifyBrCodeCrc,
} from '../../../src/core/brcode/index.js';
import vectors from '../../vectors/brcode.official.json';

const STATIC_EVP_TLV =
  '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***';

function withCrc(tlvData: string): string {
  const body = `${tlvData}6304`;
  return `${body}${computeCrc16Ccitt(body)}`;
}

describe('BR Code CRC16-CCITT', () => {
  it('computes golden CRC from manual static EVP example', () => {
    const body =
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***6304';
    expect(computeCrc16Ccitt(body)).toBe('1D3D');
  });

  it('verifies official vector CRC values', () => {
    expect(verifyBrCodeCrc(vectors.staticEvp.payload).ok).toBe(true);
    expect(verifyBrCodeCrc(vectors.dynamicUrl.payload).ok).toBe(true);
    expect(verifyBrCodeCrc(vectors.composite.payload).ok).toBe(true);
    expect(verifyBrCodeCrc(vectors.staticCpf.payload).ok).toBe(true);
    expect(verifyBrCodeCrc(vectors.staticEmail.payload).ok).toBe(true);
  });

  it('rejects tampered CRC', () => {
    const result = verifyBrCodeCrc(vectors.negative.tamperedCrc.payload);
    expect(result.ok).toBe(false);
  });

  it('rejects payload without CRC tag header', () => {
    expect(verifyBrCodeCrc('000201').ok).toBe(false);
    expect(verifyBrCodeCrc(`${STATIC_EVP_TLV}0000ABCD`).ok).toBe(false);
  });

  it('rejects non-hex CRC characters', () => {
    const body = vectors.staticEvp.payload.slice(0, -4);
    expect(verifyBrCodeCrc(`${body}GGGG`).ok).toBe(false);
  });
});

describe('BR Code TLV parser', () => {
  it('parses nested merchant account TLV', () => {
    const root = parseTlvSequence(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***',
    );
    expect(root.ok).toBe(true);
    if (root.ok) {
      expect(findTlvField(root.fields, '00')).toBe('01');
      expect(findTlvField(root.fields, '59')).toBe('Fulano de Tal');
    }
  });

  it('rejects incomplete TLV', () => {
    expect(parseTlvSequence('0002012658').ok).toBe(false);
  });

  it('rejects non-numeric TLV length', () => {
    expect(parseTlvSequence('00XX0101').ok).toBe(false);
  });
});

describe('findPixMerchantAccount', () => {
  it('ignores tag 26 with invalid nested TLV', () => {
    expect(findPixMerchantAccount([{ id: '26', value: '00' }])).toBeUndefined();
  });

  it('ignores tag 26 with non-PIX GUI', () => {
    const nested = '0014br.gov.bcb.fake011136123e4567-e12b-12d1-a456-426655440000';
    expect(findPixMerchantAccount([{ id: '26', value: nested }])).toBeUndefined();
  });
});

describe('BR Code structural validation', () => {
  it('rejects wrong payload format indicator', () => {
    const payload = withCrc(
      '00020226580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***',
    );
    const result = parseBrCodePayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects missing PIX merchant account', () => {
    const payload = withCrc(
      '0002015204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***',
    );
    const result = parseBrCodePayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('merchant account');
    }
  });

  it('rejects non-PIX merchant account GUI', () => {
    const payload = withCrc(
      '00020126590015br.gov.bcb.fake0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***',
    );
    const result = parseBrCodePayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('merchant account');
    }
  });

  it('rejects merchant account without PIX key or initiation URL', () => {
    const payload = withCrc(
      '00020126180014br.gov.bcb.pix5204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***',
    );
    const result = parseBrCodePayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('key (01) or initiation URL (25)');
    }
  });

  it('rejects invalid country code', () => {
    const payload = withCrc(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802US5913Fulano de Tal6008BRASILIA62070503***',
    );
    const result = parseBrCodePayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('country code');
    }
  });

  it('rejects missing merchant name or city', () => {
    const payload = withCrc(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR6008BRASILIA62070503***',
    );
    const result = parseBrCodePayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain('merchant name');
    }
  });

  it('rejects invalid nested PIX key', () => {
    const payload = withCrc(
      '00020126330014br.gov.bcb.pix0111000000000005204000053039865802BR5913Fulano de Tal6008BRASILIA62070503***',
    );
    const result = parseBrCodePayload(payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(['INVALID_CHECK_DIGIT', 'KNOWN_INVALID_PATTERN']).toContain(result.code);
    }
  });

  it('ignores malformed additional data tag 62', () => {
    const payload = withCrc(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA62079999999',
    );
    const result = parseBrCode(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.txid).toBeUndefined();
    }
  });

  it('parses payload without additional data tag 62', () => {
    const payload = withCrc(
      '00020126580014br.gov.bcb.pix0136123e4567-e12b-12d1-a456-4266554400005204000053039865802BR5913Fulano de Tal6008BRASILIA',
    );
    const result = parseBrCode(payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.txid).toBeUndefined();
    }
  });

  it('rejects malformed TLV after valid CRC', () => {
    const result = parseBrCodePayload(withCrc('0002012658'));
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });
});

describe('BR Code golden vectors — Bacen manual', () => {
  it.each([
    ['staticEvp', vectors.staticEvp],
    ['staticCpf', vectors.staticCpf],
    ['staticEmail', vectors.staticEmail],
    ['composite', vectors.composite],
  ] as const)('parseBrCode parses %s', (_label, vector) => {
    const result = parseBrCode(vector.payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.merchantName).toBe(vector.merchantName);
      expect(result.merchantCity).toBe(vector.merchantCity);
      if (vector.pixKey) {
        expect(result.pixKey).toBe(vector.pixKey);
      }
      expect(result.pixKeyType).toBe(vector.pixKeyType);
    }
  });

  it('parseBrCode parses dynamic URL payload', () => {
    const result = parseBrCode(vectors.dynamicUrl.payload);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.amount).toBe(vectors.dynamicUrl.amount);
      expect(result.txid).toBe(vectors.dynamicUrl.txid);
      expect(result.pixInitiationUrl).toBe(vectors.dynamicUrl.pixInitiationUrl);
      expect(result.pixKey).toBeUndefined();
    }
  });

  it('validateBrCode accepts static golden payloads', () => {
    expect(validateBrCode(BRCODE_GOLDEN_STATIC_EVP).ok).toBe(true);
    expect(validateBrCode(BRCODE_GOLDEN_STATIC_CPF).ok).toBe(true);
    expect(validateBrCode(BRCODE_GOLDEN_STATIC_EMAIL).ok).toBe(true);
    expect(validateBrCode(BRCODE_GOLDEN_COMPOSITE).ok).toBe(true);
  });

  it('validateBrCode rejects dynamic URL-only payload', () => {
    const result = validateBrCode(BRCODE_GOLDEN_DYNAMIC_URL);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('exports official source URL', () => {
    expect(BRCODE_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });
});

describe('BR Code negative cases', () => {
  it('rejects empty input', () => {
    const result = parseBrCodePayload('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects invalid characters', () => {
    const result = parseBrCodePayload('000201\u0001invalid');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('rejects tampered CRC via parseBrCode', () => {
    const result = parseBrCode(vectors.negative.tamperedCrc.payload);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe(vectors.negative.tamperedCrc.code);
    }
  });

  it('normalizes whitespace in payload', () => {
    const spaced = `  ${vectors.staticEvp.payload}  `;
    expect(parseBrCode(spaced).ok).toBe(true);
    expect(normalizeBrCodePayload('  abc  ')).toBe('abc');
  });

  it('isValidBrCode wrapper matches validateBrCode', () => {
    expect(isValidBrCode(BRCODE_GOLDEN_STATIC_EVP)).toBe(true);
    expect(isValidBrCode(vectors.negative.tamperedCrc.payload)).toBe(false);
  });
});
