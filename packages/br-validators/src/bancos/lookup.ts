/**
 * Bacen STR participant lookup — offline embedded data from official STR CSV.
 * @see https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv
 */

import bancosData from './data/bancos.json';
import type { Banco } from './types.js';

const bancos: readonly Banco[] = bancosData;

function normalizeCodigo(codigo: string): string {
  const digits = codigo.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(3, '0').slice(-3);
}

function normalizeIspb(ispb: string): string {
  const digits = ispb.replace(/\D/g, '');
  if (digits.length === 0) {
    return '';
  }
  return digits.padStart(8, '0');
}

export function getBancos(): readonly Banco[] {
  return bancos;
}

export function getBancoPorCodigo(codigo: string): Banco | undefined {
  const normalized = normalizeCodigo(codigo);
  if (normalized.length !== 3) {
    return undefined;
  }
  return bancos.find((banco) => banco.codigo === normalized);
}

export function getBancoPorIspb(ispb: string): Banco | undefined {
  const normalized = normalizeIspb(ispb);
  if (normalized.length !== 8) {
    return undefined;
  }
  return bancos.find((banco) => banco.ispb === normalized);
}
