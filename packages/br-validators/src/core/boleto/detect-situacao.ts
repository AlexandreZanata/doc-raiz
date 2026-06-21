/**
 * Situação 1 vs Situação 2 detection (Anexo V §2.3.2).
 * @see BR-BOLETO-011
 */
import {
  BOLETO_CODIGO_BARRAS_LENGTH,
  BOLETO_CODE_ISPB_HOLDER,
  BOLETO_CURRENCY_ISPB,
  BOLETO_CURRENCY_REAL,
  BOLETO_LINHA_LENGTH,
} from './constants.js';

export type BoletoSituacaoKind = 'situacao-1' | 'situacao-2' | 'unknown';

export type BoletoSituacaoCode = '1' | '2';

export function toBoletoSituacaoCode(kind: BoletoSituacaoKind): BoletoSituacaoCode | undefined {
  if (kind === 'situacao-1') {
    return '1';
  }
  if (kind === 'situacao-2') {
    return '2';
  }
  return undefined;
}

export function detectBoletoSituacao(stripped: string): BoletoSituacaoKind {
  if (
    stripped.length !== BOLETO_LINHA_LENGTH &&
    stripped.length !== BOLETO_CODIGO_BARRAS_LENGTH
  ) {
    return 'unknown';
  }

  if (stripped.slice(0, 3) === BOLETO_CODE_ISPB_HOLDER) {
    if (stripped.charAt(3) === BOLETO_CURRENCY_ISPB) {
      return 'situacao-2';
    }
    return 'unknown';
  }

  if (stripped.charAt(3) === BOLETO_CURRENCY_REAL) {
    return 'situacao-1';
  }

  return 'unknown';
}
