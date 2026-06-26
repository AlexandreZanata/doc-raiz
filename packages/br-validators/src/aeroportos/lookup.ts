/**
 * Brazilian airports — offline embedded data from official ANAC source.
 * @see docs/OFFICIAL-SOURCES.md#aeroportos
 */

import aeroportosData from './data/aeroportos.json';
import type { Aeroporto } from './types.js';

const aeroportos: readonly Aeroporto[] = aeroportosData;

function normalizeIata(code: string): string {
  return code.trim().toUpperCase();
}

function normalizeIcao(code: string): string {
  return code.trim().toUpperCase();
}

/** Returns every embedded ANAC aerodrome row (in-memory reference, not a copy). */
export function getAllAeroportos(): readonly Aeroporto[] {
  return aeroportos;
}

/** @deprecated Use {@link getAllAeroportos} instead. Removed in v2.0. */
export function getAeroportos(): readonly Aeroporto[] {
  return getAllAeroportos();
}

export function getAeroportoPorIata(code: string): Aeroporto | undefined {
  const normalized = normalizeIata(code);
  if (!/^[A-Z0-9]{3}$/.test(normalized)) {
    return undefined;
  }
  return aeroportos.find((aeroporto) => aeroporto.iata === normalized);
}

export function getAeroportoPorIcao(code: string): Aeroporto | undefined {
  const normalized = normalizeIcao(code);
  if (!/^[A-Z]{4}$/.test(normalized)) {
    return undefined;
  }
  return aeroportos.find((aeroporto) => aeroporto.icao === normalized);
}

export function getAeroportosPorMunicipio(ibgeCodigo: number): readonly Aeroporto[] {
  if (!Number.isInteger(ibgeCodigo) || ibgeCodigo <= 0) {
    return [];
  }
  return aeroportos.filter((aeroporto) => aeroporto.municipioIbge === ibgeCodigo);
}
