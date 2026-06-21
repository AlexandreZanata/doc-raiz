import { describe, expect, it } from 'vitest';
import {
  BOLETO_GOLDEN_CODIGO_BARRAS,
  computeModulo11BarcodeDv,
  validateSemanticFields,
} from '../../../src/core/boleto/index.js';

describe('validateSemanticFields', () => {
  it('returns null for Situação 2 barcode', () => {
    expect(
      validateSemanticFields('98807607469480001121234567890123456789012345', {
        validateDueFactor: true,
        validateAmount: true,
      }, 'codigo-barras'),
    ).toBeNull();
  });

  it('returns factor failure for out-of-range factor slice', () => {
    const withoutDv = `03399998${BOLETO_GOLDEN_CODIGO_BARRAS.slice(9)}`;
    const barcode = `${withoutDv.slice(0, 4)}${String(computeModulo11BarcodeDv(withoutDv))}${withoutDv.slice(4)}`;
    const result = validateSemanticFields(barcode, {
      validateDueFactor: true,
    }, 'codigo-barras');
    expect(result?.ok).toBe(false);
    if (result) expect(result.code).toBe('UNSUPPORTED_FORMAT');
  });

  it('validates amount slice on full Situação 1 barcode', () => {
    expect(
      validateSemanticFields(BOLETO_GOLDEN_CODIGO_BARRAS, {
        validateAmount: true,
      }, 'codigo-barras'),
    ).toBeNull();
  });
});
