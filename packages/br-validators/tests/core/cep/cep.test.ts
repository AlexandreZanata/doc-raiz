import { describe, expect, it } from 'vitest';
import {
  CEP_GOLDEN_PRIMARY,
  CEP_GOLDEN_SECONDARY,
  CEP_OFFICIAL_SOURCE_URL,
} from '../../../src/core/cep/constants.js';
import { applyCepMask } from '../../../src/core/cep/mask.js';
import { isValidCep, validateCep } from '../../../src/core/cep/index.js';
import { stripCep } from '../../../src/strip/cep.js';
import { formatCep } from '../../../src/format/cep.js';
import vectors from '../../vectors/cep.official.json';

describe('CEP golden vectors — Correios', () => {
  it('validates official primary CEP 01310100', () => {
    expect(isValidCep(CEP_GOLDEN_PRIMARY)).toBe(true);
    expect(isValidCep(vectors.primary.canonical)).toBe(true);
  });

  it('validates masked official input', () => {
    expect(isValidCep(vectors.primary.formatted)).toBe(true);
    expect(isValidCep('01310-100')).toBe(true);
  });

  it('validates secondary cross-check vector', () => {
    expect(isValidCep(CEP_GOLDEN_SECONDARY)).toBe(true);
    expect(isValidCep(vectors.secondary.formatted)).toBe(true);
  });

  it('formats golden vector to official mask', () => {
    const result = formatCep(CEP_GOLDEN_PRIMARY);
    expect(result).toEqual({ ok: true, formatted: '01310-100' });
  });

  it('exports official source URL', () => {
    expect(CEP_OFFICIAL_SOURCE_URL).toBe(vectors.url);
  });
});

describe('CEP structural validation', () => {
  it('rejects empty input', () => {
    const result = validateCep('');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('EMPTY_INPUT');
    }
  });

  it('rejects wrong length', () => {
    const result = validateCep('1234567');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects length 9', () => {
    const result = validateCep('123456789');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });

  it('rejects invalid characters', () => {
    const result = validateCep('01310-10A');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_CHARACTER');
    }
  });

  it('accepts all zeros structurally', () => {
    expect(isValidCep('00000000')).toBe(true);
  });

  it('returns branded value on success', () => {
    const result = validateCep(CEP_GOLDEN_PRIMARY);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toBe(CEP_GOLDEN_PRIMARY);
      expect(result.format).toBe('numeric');
    }
  });
});

describe('stripCep', () => {
  it('removes mask characters', () => {
    expect(stripCep('01310-100')).toBe(CEP_GOLDEN_PRIMARY);
  });

  it('preserves leading zeros', () => {
    expect(stripCep('01310-100')).toBe('01310100');
  });

  it('accepts spaces in input', () => {
    expect(isValidCep('01310 100')).toBe(true);
  });
});

describe('formatCep errors', () => {
  it('returns error for invalid length', () => {
    const result = formatCep('1234567');
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe('INVALID_LENGTH');
    }
  });
});

describe('applyCepMask', () => {
  it('throws when canonical length is wrong', () => {
    expect(() => applyCepMask('123')).toThrow('CEP must have exactly 8 digits to apply mask');
  });
});
