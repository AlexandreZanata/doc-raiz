import { describe, expect, it } from 'vitest';
import { cnpjCharValue } from '../../../src/core/cnpj/ascii-value.js';

describe('cnpjCharValue', () => {
  it('maps digit 0 to 0 (ASCII 48 - 48)', () => {
    expect(cnpjCharValue('0')).toBe(0);
  });

  it('maps letter A to 17 (ASCII 65 - 48) — RFB Q14', () => {
    expect(cnpjCharValue('A')).toBe(17);
  });

  it('maps letter E to 21 — RFB Q14 golden example', () => {
    expect(cnpjCharValue('E')).toBe(21);
  });
});
