import { describe, expect, it } from 'vitest';
import {
  CNPJ_GOLDEN_ALPHANUMERIC,
  CNPJ_GOLDEN_NUMERIC,
  CNPJ_OFFICIAL_SOURCE_URL,
} from '../../../src/core/cnpj/constants.js';
import { applyCnpjMask } from '../../../src/core/cnpj/mask.js';
import { isValidCnpjAlphanumeric } from '../../../src/core/cnpj/alphanumeric.js';
import { isValidCnpjNumeric } from '../../../src/core/cnpj/numeric.js';
import { detectCnpjFormat, containsLetter } from '../../../src/core/cnpj/detect.js';
import {
  isValidCnpj,
  validateCnpj,
} from '../../../src/core/cnpj/index.js';
import { stripCnpj } from '../../../src/strip/cnpj.js';
import { formatCnpj } from '../../../src/format/cnpj.js';

describe('CNPJ golden vectors — RFB Q14', () => {
  it('validates official alphanumeric CNPJ 12ABC34501DE35', () => {
    expect(isValidCnpjAlphanumeric(CNPJ_GOLDEN_ALPHANUMERIC)).toBe(true);
    expect(isValidCnpj(CNPJ_GOLDEN_ALPHANUMERIC)).toBe(true);
  });

  it('validates masked official input', () => {
    expect(isValidCnpj('12.ABC.345/01DE-35')).toBe(true);
  });

  it('formats golden vector to official mask', () => {
    const result = formatCnpj(CNPJ_GOLDEN_ALPHANUMERIC);
    expect(result).toEqual({ ok: true, formatted: '12.ABC.345/01DE-35' });
  });
});

describe('CNPJ numeric', () => {
  it('validates known numeric CNPJ', () => {
    expect(isValidCnpjNumeric(CNPJ_GOLDEN_NUMERIC)).toBe(true);
    expect(isValidCnpj(CNPJ_GOLDEN_NUMERIC)).toBe(true);
  });

  it('validates masked numeric CNPJ', () => {
    expect(isValidCnpj('11.222.333/0001-81')).toBe(true);
  });

  it('rejects all identical digits', () => {
    expect(isValidCnpjNumeric('11111111111111')).toBe(false);
    const result = validateCnpj('11111111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects invalid check digits', () => {
    expect(isValidCnpjNumeric('11222333000180')).toBe(false);
    const result = validateCnpj('11222333000180');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });
});

describe('CNPJ alphanumeric edge cases', () => {
  it('rejects wrong check digits', () => {
    expect(isValidCnpjAlphanumeric('12ABC34501DE45')).toBe(false);
    const result = validateCnpj('12ABC34501DE45');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });

  it('rejects all-identical letter base with invalid structure at check digits', () => {
    expect(isValidCnpjAlphanumeric('AAAAAAAAAAAAAA')).toBe(false);
    const result = validateCnpj('AAAAAAAAAAAAAA');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('UNSUPPORTED_FORMAT');
    }
  });

  it('rejects invalid structure via isValidCnpjAlphanumeric', () => {
    expect(isValidCnpjAlphanumeric('SHORT')).toBe(false);
    expect(isValidCnpjAlphanumeric('12ABC34501DE3X')).toBe(false);
  });

  it('rejects repeated characters in isValidCnpjAlphanumeric', () => {
    expect(isValidCnpjAlphanumeric('11111111111111')).toBe(false);
  });

  it('accepts lowercase input after normalization', () => {
    expect(isValidCnpj('12abc34501de35')).toBe(true);
  });
});

describe('detectCnpjFormat', () => {
  it('detects numeric format', () => {
    expect(detectCnpjFormat(CNPJ_GOLDEN_NUMERIC)).toBe('numeric');
  });

  it('detects alphanumeric format', () => {
    expect(detectCnpjFormat(CNPJ_GOLDEN_ALPHANUMERIC)).toBe('alphanumeric');
  });

  it('returns unknown for invalid length', () => {
    expect(detectCnpjFormat('123')).toBe('unknown');
  });
});

describe('containsLetter', () => {
  it('returns true when letters present', () => {
    expect(containsLetter('12ABC')).toBe(true);
  });

  it('returns false for digits only', () => {
    expect(containsLetter('11222333000181')).toBe(false);
  });
});

describe('stripCnpj', () => {
  it('removes mask and uppercases', () => {
    expect(stripCnpj('12.ABC.345/01DE-35')).toBe('12ABC34501DE35');
  });
});

describe('validateCnpj structural errors', () => {
  it('rejects empty input', () => {
    const result = validateCnpj('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('EMPTY_INPUT');
  });

  it('rejects wrong length', () => {
    const result = validateCnpj('123');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('rejects invalid characters', () => {
    const result = validateCnpj('12ABC34501DE3!');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_CHARACTER');
  });

  it('rejects unsupported format — non-numeric check digits', () => {
    const result = validateCnpj('12ABC34501DEEE');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });
});

describe('validateCnpj success branches', () => {
  it('returns branded value and format for alphanumeric', () => {
    const result = validateCnpj(CNPJ_GOLDEN_ALPHANUMERIC);
    expect(result).toEqual({
      ok: true,
      value: CNPJ_GOLDEN_ALPHANUMERIC,
      format: 'alphanumeric',
    });
  });

  it('returns numeric format for numeric CNPJ', () => {
    const result = validateCnpj(CNPJ_GOLDEN_NUMERIC);
    expect(result).toEqual({
      ok: true,
      value: CNPJ_GOLDEN_NUMERIC,
      format: 'numeric',
    });
  });
});

describe('formatCnpj errors', () => {
  it('returns error when validation fails', () => {
    const result = formatCnpj('invalid');
    expect(result.ok).toBe(false);
  });
});

describe('formatCnpj wrappers', () => {
  it('formatCnpjNumeric delegates to formatCnpj', async () => {
    const { formatCnpjNumeric } = await import('../../../src/format/cnpj.js');
    expect(formatCnpjNumeric(CNPJ_GOLDEN_NUMERIC)).toEqual({
      ok: true,
      formatted: '11.222.333/0001-81',
    });
  });

  it('formatCnpjAlphanumeric delegates to formatCnpj', async () => {
    const { formatCnpjAlphanumeric } = await import('../../../src/format/cnpj.js');
    expect(formatCnpjAlphanumeric(CNPJ_GOLDEN_ALPHANUMERIC)).toEqual({
      ok: true,
      formatted: '12.ABC.345/01DE-35',
    });
  });
});

describe('applyCnpjMask', () => {
  it('throws when canonical length is not 14', () => {
    expect(() => applyCnpjMask('123')).toThrow(
      'CNPJ must have exactly 14 characters to apply mask',
    );
  });
});

describe('official source constant', () => {
  it('points to RFB PDF', () => {
    expect(CNPJ_OFFICIAL_SOURCE_URL).toContain('cnpj-alfanumerico.pdf');
  });
});

describe('isValidCnpjNumeric edge cases', () => {
  it('rejects non-numeric after strip', () => {
    expect(isValidCnpjNumeric('12ABC34501DE35')).toBe(false);
  });

  it('rejects wrong length digits', () => {
    expect(isValidCnpjNumeric('123')).toBe(false);
  });
});
