import {
  BOLETO_GOLDEN_LINHA_STRIPPED,
  computeModulo11BarcodeDv,
  convertCodigoBarrasToLinhaDigits,
  formatLinhaDigitavel,
  validateCodigoBarras,
} from '@br-validators/core';
import { mulberry32, pickItem, randomDigits, type PlaygroundRng } from './random';

const BANK_CODES = ['001', '033', '104', '237', '341', '756'] as const;
const BOLETO_CURRENCY = '9';

function buildBarcode(rng: PlaygroundRng): string | null {
  const bank = pickItem(rng, BANK_CODES);
  const fator = randomDigits(rng, 4);
  const valor = randomDigits(rng, 10);
  const freeField = randomDigits(rng, 25);
  const withoutDv = bank + BOLETO_CURRENCY + fator + valor + freeField;
  const dv = computeModulo11BarcodeDv(withoutDv);
  const barcode = `${bank}${BOLETO_CURRENCY}${String(dv)}${fator}${valor}${freeField}`;

  if (!validateCodigoBarras(barcode).ok) {
    return null;
  }

  return barcode;
}

export function generateBoletoDocument(masked: boolean, seed: number): string {
  const rng = mulberry32(seed);

  for (let attempt = 0; attempt < 80; attempt++) {
    const barcode = buildBarcode(rng);
    if (!barcode) {
      continue;
    }

    const linha = convertCodigoBarrasToLinhaDigits(barcode);
    if (!masked) {
      return linha;
    }

    return formatLinhaDigitavel(linha);
  }

  return masked
    ? formatLinhaDigitavel(BOLETO_GOLDEN_LINHA_STRIPPED)
    : BOLETO_GOLDEN_LINHA_STRIPPED;
}
