import { PIS_PASEP_MASK_PATTERN } from './constants.js';

/** Mask XXX.XXXXX.XX-X (BR-PIS-006). */
export function applyPisPasepMask(canonical: string): string {
  const match = PIS_PASEP_MASK_PATTERN.exec(canonical);
  if (!match) {
    throw new Error('PIS/PASEP must have exactly 11 digits to apply mask');
  }
  return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
}
