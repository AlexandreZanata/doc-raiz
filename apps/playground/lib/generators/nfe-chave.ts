import {
  computeNfeChaveCheckDigit,
  formatNfeChave,
  NFE_CHAVE_GOLDEN_PRIMARY,
  NFE_IBGE_UF_CODES,
  NFE_MODELO_NFE,
  validateNfeChave,
} from '@br-validators/core';
import { mulberry32, pickItem, randomDigits } from './random';

const NFE_UF_CODES = [...NFE_IBGE_UF_CODES] as number[];

export function generateNfeChaveDocument(masked: boolean, seed: number): string {
  const rng = mulberry32(seed);

  for (let attempt = 0; attempt < 80; attempt++) {
    const cuf = String(pickItem(rng, NFE_UF_CODES)).padStart(2, '0');
    const aamm = randomDigits(rng, 4);
    const cnpj = randomDigits(rng, 14);
    const serie = randomDigits(rng, 3);
    const invoiceNumber = randomDigits(rng, 9);
    const emissionType = String(Math.floor(rng() * 10));
    const numericCode = randomDigits(rng, 8);
    const base43 = `${cuf}${aamm}${cnpj}${NFE_MODELO_NFE}${serie}${invoiceNumber}${emissionType}${numericCode}`;
    const candidate = `${base43}${String(computeNfeChaveCheckDigit(base43))}`;

    if (!validateNfeChave(candidate).ok) {
      continue;
    }

    if (!masked) {
      return candidate;
    }

    const formatted = formatNfeChave(candidate);
    return formatted.ok ? formatted.formatted : candidate;
  }

  if (!masked) {
    return NFE_CHAVE_GOLDEN_PRIMARY;
  }

  const formatted = formatNfeChave(NFE_CHAVE_GOLDEN_PRIMARY);
  return formatted.ok ? formatted.formatted : NFE_CHAVE_GOLDEN_PRIMARY;
}
