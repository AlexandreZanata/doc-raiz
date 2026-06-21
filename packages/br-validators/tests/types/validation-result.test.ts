import { describe, expect, it } from 'vitest';
import { brandCnpj, brandCep, brandCpf } from '../../src/types/validation-result.js';

describe('brandCnpj', () => {
  it('casts string to Cnpj brand', () => {
    const value = brandCnpj('12ABC34501DE35');
    expect(value).toBe('12ABC34501DE35');
  });
});

describe('brandCpf', () => {
  it('casts string to Cpf brand', () => {
    const value = brandCpf('12345678909');
    expect(value).toBe('12345678909');
  });
});

describe('brandCep', () => {
  it('casts string to Cep brand', () => {
    const value = brandCep('01310100');
    expect(value).toBe('01310100');
  });
});
