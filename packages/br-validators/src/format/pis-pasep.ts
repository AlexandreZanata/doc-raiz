import { applyPisPasepMask } from '../core/pis-pasep/mask.js';
import { validatePisPasep } from '../core/pis-pasep/index.js';
import type { FormatResult } from '../types/validation-result.js';

export function formatPisPasep(input: string): FormatResult {
  const result = validatePisPasep(input);
  if (!result.ok) {
    return { ok: false, code: result.code, message: result.message };
  }
  return { ok: true, formatted: applyPisPasepMask(result.value) };
}
