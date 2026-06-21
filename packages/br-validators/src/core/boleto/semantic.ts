/**
 * Optional semantic checks for Situação 1 cobrança fields.
 * @see BR-BOLETO-012, BR-BOLETO-013
 */
import type { BoletoInputKind, BoletoValidationResult } from '../../types/validation-result.js';
import { detectBoletoSituacao } from './detect-situacao.js';
import { validateFatorVencimento } from './fator-vencimento.js';
import { validateValorDocumento } from './valor-documento.js';

export type SemanticValidationOptions = {
  validateDueFactor?: boolean;
  validateAmount?: boolean;
};

type FailedResult = Extract<BoletoValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string, inputKind: BoletoInputKind): FailedResult {
  return { ok: false, code, message, inputKind };
}

export function validateSemanticFields(
  barcode: string,
  options: SemanticValidationOptions,
  inputKind: BoletoInputKind,
): FailedResult | null {
  if (detectBoletoSituacao(barcode) !== 'situacao-1') {
    return null;
  }

  if (options.validateDueFactor) {
    const factorResult = validateFatorVencimento(barcode.slice(5, 9));
    if (!factorResult.ok) {
      return failure(factorResult.code, factorResult.message, inputKind);
    }
  }

  if (options.validateAmount && detectBoletoSituacao(barcode) === 'situacao-1') {
    validateValorDocumento(barcode.slice(9, 19));
  }

  return null;
}
