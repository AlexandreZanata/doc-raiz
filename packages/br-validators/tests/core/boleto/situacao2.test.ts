import { describe, expect, it } from 'vitest';
import {
  detectBoletoSituacao,
  toBoletoSituacaoCode,
  validateFatorVencimento,
  validateValorDocumento,
  BOLETO_GOLDEN_CODIGO_BARRAS,
  BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2,
  BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED,
  BOLETO_GOLDEN_LINHA_STRIPPED,
} from '../../../src/core/boleto/index.js';
import semanticVectors from '../../vectors/boleto.semantic.official.json';
import situacao2Vectors from '../../vectors/boleto.situacao2.official.json';

describe('detectBoletoSituacao', () => {
  it('detects Situação 1 from Santander linha', () => {
    expect(detectBoletoSituacao(BOLETO_GOLDEN_LINHA_STRIPPED)).toBe('situacao-1');
    expect(toBoletoSituacaoCode('situacao-1')).toBe('1');
  });

  it('detects Situação 2 from golden vector', () => {
    expect(detectBoletoSituacao(situacao2Vectors.golden.linhaStripped)).toBe('situacao-2');
    expect(detectBoletoSituacao(situacao2Vectors.golden.codigoBarras)).toBe('situacao-2');
    expect(toBoletoSituacaoCode('situacao-2')).toBe('2');
    expect(toBoletoSituacaoCode('unknown')).toBeUndefined();
  });

  it('returns unknown for invalid currency combinations', () => {
    expect(detectBoletoSituacao('98891234567890123456789012345678901234567890123')).toBe('unknown');
    expect(detectBoletoSituacao('123')).toBe('unknown');
  });
});

describe('validateFatorVencimento', () => {
  it.each(semanticVectors.pairs)('accepts factor $factor ($note)', ({ factor, hasDueDate }) => {
    const result = validateFatorVencimento(factor);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hasDueDate).toBe(hasDueDate);
    }
  });

  it('rejects invalid factor length', () => {
    const result = validateFatorVencimento('123');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });

  it('rejects out-of-range factor', () => {
    const result = validateFatorVencimento('9998');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });
});

describe('validateValorDocumento', () => {
  it.each(semanticVectors.amounts)('accepts amount $value ($note)', ({ value, amountCents }) => {
    const result = validateValorDocumento(value);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.amountCents).toBe(amountCents);
  });

  it('rejects invalid amount length', () => {
    const result = validateValorDocumento('123');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_LENGTH');
  });
});

describe('Situação 2 golden constants', () => {
  it('matches situacao2 vector file', () => {
    expect(BOLETO_GOLDEN_LINHA_SITUACAO2_STRIPPED).toBe(situacao2Vectors.golden.linhaStripped);
    expect(BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2).toBe(situacao2Vectors.golden.codigoBarras);
  });

  it('extracts ISPB from Situação 2 barcode campo 5 region', () => {
    expect(BOLETO_GOLDEN_CODIGO_BARRAS_SITUACAO2.slice(5, 19)).toBe(situacao2Vectors.golden.ispb);
  });

  it('Santander golden remains Situação 1', () => {
    expect(detectBoletoSituacao(BOLETO_GOLDEN_CODIGO_BARRAS)).toBe('situacao-1');
  });
});
