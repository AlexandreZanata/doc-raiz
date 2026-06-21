import { CNPJ_MASK_PATTERN } from './constants.js';

/** Mask XX.XXX.XXX/XXXX-DD — same for numeric and alphanumeric (RFB Q21). */
export function applyCnpjMask(canonical: string): string {
  const match = CNPJ_MASK_PATTERN.exec(canonical);
  if (!match) {
    throw new Error('CNPJ must have exactly 14 characters to apply mask');
  }
  return `${match[1]}.${match[2]}.${match[3]}/${match[4]}-${match[5]}`;
}
