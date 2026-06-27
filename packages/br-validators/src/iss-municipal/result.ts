import { ISS_MUNICIPAL_ESTIMATION_WARNING } from './constants.js';
import type { IssMunicipalFonte, IssMunicipalResult, IssMunicipalRow } from './types.js';

export function resolveIssMunicipalFonte(estimativa: boolean): IssMunicipalFonte {
  return estimativa ? 'estimativa' : 'oficial';
}

export function buildIssMunicipalResult(row: IssMunicipalRow): IssMunicipalResult {
  return {
    ...row,
    fonte: resolveIssMunicipalFonte(row.estimativa),
    warning: ISS_MUNICIPAL_ESTIMATION_WARNING,
  };
}
