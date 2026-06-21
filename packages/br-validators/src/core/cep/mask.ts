import { CEP_MASK_PATTERN } from './constants.js';

/** Mask XXXXX-XXX (BR-CEP-004). */
export function applyCepMask(canonical: string): string {
  const match = CEP_MASK_PATTERN.exec(canonical);
  if (!match) {
    throw new Error('CEP must have exactly 8 digits to apply mask');
  }
  return `${match[1]}-${match[2]}`;
}
