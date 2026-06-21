import { describe, expect, it } from 'vitest';
import { brandCnpj } from '../../src/types/validation-result.js';

describe('brandCnpj', () => {
  it('casts string to Cnpj brand', () => {
    const value = brandCnpj('12ABC34501DE35');
    expect(value).toBe('12ABC34501DE35');
  });
});
