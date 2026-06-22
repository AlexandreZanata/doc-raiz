import { describe, expect, it } from 'vitest';
import {
  BRCODE_GOLDEN_STATIC_EVP,
  BOLETO_GOLDEN_LINHA_MASKED,
  IE_SUPPORTED_UFS,
  parseBrCode,
  validateBoleto,
  validateCartaoCredito,
  validateCep,
  validateCnpj,
  validateCpf,
  validateInscricaoEstadual,
  validatePisPasep,
  validatePixKey,
  validatePlaca,
  validateTelefone,
} from '@br-validators/core';
import { generateCep } from '../lib/generators/cep';
import { generateCnpj } from '../lib/generators/cnpj';
import { generateCpf } from '../lib/generators/cpf';
import { generateCreditCard } from '../lib/generators/cartao';
import { generateIeDocument } from '../lib/generators/ie';
import { generatePixEvp as generatePixEvpSample } from '../lib/generators/pix';
import { generatePisPasep as generatePisPasepSample } from '../lib/generators/pis-pasep';
import { generatePlaca as generatePlacaSample } from '../lib/generators/placa';
import { generateTelefoneDocument } from '../lib/generators/telefone';
import { isTelefoneDddInUf } from '../lib/telefone-ddd-by-uf';

describe('playground generators', () => {
  it('generates valid CPF', () => {
    const value = generateCpf();
    expect(validateCpf(value).ok).toBe(true);
  });

  it('generates valid CNPJ', () => {
    const value = generateCnpj();
    expect(validateCnpj(value).ok).toBe(true);
  });

  it('generates valid CEP format', () => {
    const value = generateCep();
    expect(validateCep(value).ok).toBe(true);
  });

  it('generates valid PIS/PASEP', () => {
    const value = generatePisPasepSample();
    expect(validatePisPasep(value).ok).toBe(true);
  });

  it('generates valid PIX EVP key', () => {
    const value = generatePixEvpSample();
    expect(validatePixKey(value).ok).toBe(true);
  });

  it('generates valid Mercosul plate', () => {
    const value = generatePlacaSample('mercosul');
    expect(validatePlaca(value).ok).toBe(true);
  });

  it('generates valid phone for selected state', () => {
    const value = generateTelefoneDocument('SP', 'celular', false, 1);
    expect(validateTelefone(value).ok).toBe(true);
    expect(isTelefoneDddInUf(value.slice(0, 2), 'SP')).toBe(true);
  });

  it('generates valid credit card for selected brand', () => {
    const value = generateCreditCard('mastercard', false, 1);
    expect(validateCartaoCredito(value).ok).toBe(true);
    expect(value.startsWith('5')).toBe(true);
  });

  it('returns valid IE sample for each UF', () => {
    for (const uf of IE_SUPPORTED_UFS) {
      expect(validateInscricaoEstadual(generateIeDocument(uf, false), { uf }).ok).toBe(true);
      expect(validateInscricaoEstadual(generateIeDocument(uf, true), { uf }).ok).toBe(true);
    }
  });

  it('keeps supported BR Code and boleto samples valid', () => {
    expect(parseBrCode(BRCODE_GOLDEN_STATIC_EVP).ok).toBe(true);
    expect(validateBoleto(BOLETO_GOLDEN_LINHA_MASKED).ok).toBe(true);
  });
});
