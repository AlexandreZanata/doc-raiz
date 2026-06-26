/**
 * ICC Incoterms 2020 lookup — offline static reference (code + name only).
 * @see docs/OFFICIAL-SOURCES.md#incoterms
 */

import incotermsData from './data/incoterms.json';
import type { Incoterm } from './types.js';

const incoterms: readonly Incoterm[] = incotermsData as Incoterm[];

function normalizeCodigo(codigo: string): string {
  return codigo.trim().toUpperCase();
}

/** Returns every embedded Incoterms 2020 code (in-memory reference, not a copy). */
export function getAllIncoterms(): readonly Incoterm[] {
  return incoterms;
}

/** @deprecated Use {@link getAllIncoterms} instead. Removed in v2.0. */
export function getIncoterms(): readonly Incoterm[] {
  return getAllIncoterms();
}

export function getIncotermPorCodigo(codigo: string): Incoterm | undefined {
  const normalized = normalizeCodigo(codigo);
  if (!/^[A-Z]{3}$/.test(normalized)) {
    return undefined;
  }
  return incoterms.find((incoterm) => incoterm.codigo === normalized);
}
