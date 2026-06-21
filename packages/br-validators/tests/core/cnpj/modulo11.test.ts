import { describe, expect, it } from 'vitest';
import {
  computeCheckDigit,
  modulo11CheckDigit,
  weightedSum,
} from '../../../src/core/cnpj/modulo11.js';
import { CNPJ_DV1_WEIGHTS, CNPJ_DV2_WEIGHTS } from '../../../src/core/cnpj/constants.js';
import { cnpjCharValue } from '../../../src/core/cnpj/ascii-value.js';

describe('modulo11CheckDigit', () => {
  it('returns 0 when remainder is less than 2', () => {
    expect(modulo11CheckDigit(11)).toBe(0);
    expect(modulo11CheckDigit(12)).toBe(0);
  });

  it('returns 11 - remainder otherwise — RFB Q14 DV1 sum 459', () => {
    expect(modulo11CheckDigit(459)).toBe(3);
  });

  it('returns 5 for RFB Q14 DV2 sum 424', () => {
    expect(modulo11CheckDigit(424)).toBe(5);
  });
});

describe('weightedSum', () => {
  it('sums products of values and weights', () => {
    expect(weightedSum([1, 2, 3], [1, 2, 3])).toBe(14);
  });
});

describe('computeCheckDigit', () => {
  it('computes first DV for golden base 12ABC34501DE', () => {
    const base = '12ABC34501DE';
    expect(computeCheckDigit(base, CNPJ_DV1_WEIGHTS, cnpjCharValue)).toBe(3);
  });

  it('computes second DV for golden base + DV1', () => {
    const base = '12ABC34501DE3';
    expect(computeCheckDigit(base, CNPJ_DV2_WEIGHTS, cnpjCharValue)).toBe(5);
  });
});
