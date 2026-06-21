import { describe, expect, it } from 'vitest';
import {
  PIS_PASEP_GOLDEN_PRIMARY,
  PIS_PASEP_GOLDEN_SECONDARY,
  PIS_PASEP_OFFICIAL_SOURCE_URL,
} from '../../../src/core/pis-pasep/constants.js';
import { applyPisPasepMask } from '../../../src/core/pis-pasep/mask.js';
import { isValidPisPasep, validatePisPasep } from '../../../src/core/pis-pasep/index.js';
import { stripPisPasep } from '../../../src/strip/pis-pasep.js';
import { formatPisPasep } from '../../../src/format/pis-pasep.js';
import vectors from '../../vectors/pis-pasep.official.json';

describe('PIS/PASEP golden vectors — UC-006', () => {
  it('validates official primary 10027230888', () => {
    expect(isValidPisPasep(PIS_PASEP_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidPisPasep(vectors.primary.canonical)).toBe(true);
  });

  it('validates masked official input', () => {
    expect(isValidPisPasep(vectors.primary.formatted)).toBe(true);
    expect(isValidPisPasep('100.27230.88-8')).toBe(true);
  });

  it('validates secondary cross-check vector', () => {
    expect(isValidPisPasep(PIS_PASEP_GOLDEN_SECONDARY)).toBe(true);
    expect(isValidPisPasep(vectors.secondary.formatted)).toBe(true);
  });

  it('formats golden vector to official mask', () => {
    const result = formatPisPasep(PIS_PASEP_GOLDEN_PRIMARY);
    expect(result).toEqual({ ok: true, formatted: '100.27230.88-8' });
  });

  it('exports official source URL', () => {
    expect(PIS_PASEP_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });
});

describe('PIS/PASEP check digit', () => {
  it('rejects wrong check digit', () => {
    expect(isValidPisPasep('10027230889')).toBe(false);
    const result = validatePisPasep('10027230889');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHECK_DIGIT');
    }
  });
});

describe('PIS/PASEP known invalid patterns', () => {
  it('rejects all identical digits', () => {
    expect(isValidPisPasep('11111111111')).toBe(false);
    const result = validatePisPasep('11111111111');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });

  it('rejects all zeros', () => {
    expect(isValidPisPasep('00000000000')).toBe(false);
    const result = validatePisPasep('00000000000');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('KNOWN_INVALID_PATTERN');
    }
  });
});

describe('PIS/PASEP structural validation', () => {
  it('rejects empty input', () => {
    const result = validatePisPasep('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects wrong length', () => {
    const result = validatePisPasep('1002723088');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects invalid characters', () => {
    const result = validatePisPasep('100.27230.88-A');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('returns branded value on success', () => {
    const result = validatePisPasep(PIS_PASEP_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(PIS_PASEP_GOLDEN_PRIMARY);
      expect(result.format).toBe('numeric');
    }
  });
});

describe('stripPisPasep', () => {
  it('removes mask characters', () => {
    expect(stripPisPasep('100.27230.88-8')).toBe(PIS_PASEP_GOLDEN_PRIMARY);
  });

  it('preserves leading zeros', () => {
    expect(stripPisPasep('012.34567.89-0')).toBe('01234567890');
  });
});

describe('formatPisPasep errors', () => {
  it('returns error for invalid input', () => {
    const result = formatPisPasep('1002723088');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });
});

describe('applyPisPasepMask', () => {
  it('throws when canonical length is wrong', () => {
    expect(() => applyPisPasepMask('100')).toThrow('PIS/PASEP must have exactly 11 digits to apply mask');
  });
});
