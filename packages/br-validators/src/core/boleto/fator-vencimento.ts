/**
 * Due-date factor semantic validation (Situação 1 only).
 * @see BR-BOLETO-012
 */
import type { ValidationErrorCode } from '../../types/validation-result.js';

const FATOR_MIN = 1;
/** FEBRABAN factor space; values above this fail optional semantic validation. */
const FATOR_SEMANTIC_MAX = 9997;

export type FatorVencimentoValidationResult =
  | { ok: true; factor: string; hasDueDate: boolean }
  | { ok: false; code: ValidationErrorCode; message: string };

export function validateFatorVencimento(factor: string): FatorVencimentoValidationResult {
  if (!/^\d{4}$/.test(factor)) {
    return {
      ok: false,
      code: 'INVALID_LENGTH',
      message: 'Due-date factor must have exactly 4 digits',
    };
  }

  if (factor === '0000') {
    return { ok: true, factor, hasDueDate: false };
  }

  const days = Number(factor);
  if (days < FATOR_MIN || days > FATOR_SEMANTIC_MAX) {
    return {
      ok: false,
      code: 'UNSUPPORTED_FORMAT',
      message: 'Due-date factor is out of the supported range',
    };
  }

  return { ok: true, factor, hasDueDate: true };
}
