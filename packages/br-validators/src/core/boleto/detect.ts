/**
 * Boleto input kind detection — linha digitável (47) vs código de barras (44).
 * @see BR-BOLETO-001
 */
import {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_LINHA_LENGTH,
} from './constants.js';

export type DetectedBoletoInputKind = 'linha-digitavel' | 'codigo-barras' | 'arrecadacao' | 'unknown';

const LINHA_MASK_PATTERN = /^[0-9.\s]+$/;

function stripDigits(input: string): string {
  return input.replace(/\D/g, '');
}

export function detectBoletoInputKind(input: string): DetectedBoletoInputKind {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return 'unknown';
  }

  const digits = stripDigits(trimmed);

  if (digits.length === 48 && digits.startsWith('8')) {
    return 'arrecadacao';
  }

  if (digits.length === BOLETO_CODIGO_BARRAS_LENGTH && /^\d+$/.test(digits)) {
    return 'codigo-barras';
  }

  if (digits.length === BOLETO_LINHA_LENGTH) {
    if (/^\d+$/.test(trimmed)) {
      return 'linha-digitavel';
    }
    if (LINHA_MASK_PATTERN.test(trimmed)) {
      return 'linha-digitavel';
    }
    return 'unknown';
  }

  return 'unknown';
}
