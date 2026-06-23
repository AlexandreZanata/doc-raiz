/**
 * IBGE locality lookup — offline embedded data from official IBGE API.
 * @see https://servicodados.ibge.gov.br/api/docs/localidades
 */

import { IBGE_UF_SIGLA_SET } from './constants.js';
import estadosData from './data/estados.json';
import municipiosData from './data/municipios.json';
import type { Estado, Municipio } from './types.js';

const estados: readonly Estado[] = estadosData;
const municipios: readonly Municipio[] = municipiosData;

export function getEstados(): readonly Estado[] {
  return estados;
}

export function getMunicipios(options?: { uf?: string }): readonly Municipio[] {
  const uf = options?.uf;
  if (uf === undefined || uf === '') {
    return municipios;
  }

  const normalized = uf.toUpperCase();
  if (!IBGE_UF_SIGLA_SET.has(normalized)) {
    return [];
  }

  return municipios.filter((municipio) => municipio.uf === normalized);
}

export function getMunicipioPorCodigo(codigo: number): Municipio | undefined {
  return municipios.find((municipio) => municipio.codigo === codigo);
}
