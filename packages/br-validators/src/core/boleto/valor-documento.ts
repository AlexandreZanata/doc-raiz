/**
 * Document amount semantic validation (Situação 1 only).
 * @see BR-BOLETO-013
 */
import type { ValidationErrorCode } from '../../types/validation-result.js';

export type ValorDocumentoValidationResult =
  | { ok: true; amountCents: number }
  | { ok: false; code: ValidationErrorCode; message: string };

export function validateValorDocumento(value: string): ValorDocumentoValidationResult {
  if (!/^\d{10}$/.test(value)) {
    return {
      ok: false,
      code: 'INVALID_LENGTH',
      message: 'Document amount must have exactly 10 digits (centavos)',
    };
  }

  return { ok: true, amountCents: Number(value) };
}
