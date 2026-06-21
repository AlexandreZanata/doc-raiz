import { applyCepMask } from '../core/cep/mask.js';
import { validateCep } from '../core/cep/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatCep(input: string): FormatResult {
  const result = validateCep(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyCepMask(result.value) };
}
