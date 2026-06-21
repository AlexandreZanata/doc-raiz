import { CNPJ_ALPHANUMERIC_PATTERN, CNPJ_NUMERIC_PATTERN } from './constants.js';
import type { DocumentFormat } from '../../types/validation-result.js';

export function detectCnpjFormat(stripped: string): DocumentFormat | 'unknown' {
  const upper = stripped.toUpperCase();
  if (CNPJ_NUMERIC_PATTERN.test(upper)) {
    return 'numeric';
  }
  if (CNPJ_ALPHANUMERIC_PATTERN.test(upper)) {
    return 'alphanumeric';
  }
  return 'unknown';
}

export function containsLetter(value: string): boolean {
  return /[A-Za-z]/.test(value);
}
