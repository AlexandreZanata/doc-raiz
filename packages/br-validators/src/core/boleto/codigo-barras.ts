/**
 * Código de barras validation — modulo 11 general DV (Anexo X).
 * @see BR-BOLETO-003, BR-BOLETO-004, BR-BOLETO-010
 */
import type { BoletoValidationResult } from '../../types/validation-result.js';
import { brandCodigoBarras } from '../../types/validation-result.js';
import {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_CURRENCY_REAL,
} from './constants.js';
import { computeModulo11BarcodeDv } from './modulo11.js';

type FailedResult = Extract<BoletoValidationResult, { ok: false }>;

function failure(code: FailedResult['code'], message: string): FailedResult {
  return { ok: false, code, message, inputKind: 'codigo-barras' };
}

export function stripCodigoBarras(input: string): string {
  return input.replace(/\D/g, '');
}

export function validateCodigoBarras(input: string): BoletoValidationResult {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return { ok: false, code: 'EMPTY_INPUT', message: 'Código de barras input is empty' };
  }

  if (/[^0-9]/.test(trimmed)) {
    return failure('INVALID_CHARACTER', 'Código de barras contains invalid characters');
  }

  if (trimmed.length !== BOLETO_CODIGO_BARRAS_LENGTH) {
    return failure('INVALID_LENGTH', `Código de barras must have ${BOLETO_CODIGO_BARRAS_LENGTH} digits`);
  }

  if (trimmed.charAt(3) !== BOLETO_CURRENCY_REAL) {
    return failure('UNSUPPORTED_FORMAT', 'Bank boleto currency code must be 9 (Real)');
  }

  if (trimmed.charAt(4) === '0') {
    return failure('INVALID_CHECK_DIGIT', 'Barcode DV cannot be 0');
  }

  const expectedDv = String(computeModulo11BarcodeDv(trimmed.slice(0, 4) + trimmed.slice(5)));
  if (trimmed.charAt(4) !== expectedDv) {
    return failure('INVALID_CHECK_DIGIT', 'Código de barras check digit is invalid');
  }

  return {
    ok: true,
    value: brandCodigoBarras(trimmed),
    inputKind: 'codigo-barras',
    format: 'codigo-barras',
  };
}
