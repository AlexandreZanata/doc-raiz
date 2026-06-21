import { applyCnpjMask } from '../core/cnpj/mask.js';
import { validateCnpj } from '../core/cnpj/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatCnpj(input: string): FormatResult {
  const result = validateCnpj(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyCnpjMask(result.value) };
}

export function formatCnpjNumeric(input: string): FormatResult {
  return formatCnpj(input);
}

export function formatCnpjAlphanumeric(input: string): FormatResult {
  return formatCnpj(input);
}
