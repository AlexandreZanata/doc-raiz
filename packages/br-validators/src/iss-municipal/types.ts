import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface IssMunicipalRow {
  codigoIbge: number;
  nome: string;
  uf: string;
  aliquotaMin: number;
  aliquotaMax: number;
  leiUrl: string;
  capturadoEm: string;
  estimativa: boolean;
  pibRank: number | null;
}

/** Provenance of the embedded ISS alíquota row — do not use `'estimativa'` for NFSe emission. */
export type IssMunicipalFonte = 'oficial' | 'estimativa';

export interface IssMunicipalResult extends IssMunicipalRow {
  /**
   * `'oficial'` — capital seed with verified municipal legislation URL.
   * `'estimativa'` — LC 116 Art. 8 band fallback; not verified municipal legislation.
   */
  fonte: IssMunicipalFonte;
  warning: string;
}

export interface IssMunicipalDataVersion {
  id: 'iss-municipal';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  estimativa: boolean;
  contagens: {
    municipios: number;
    capitais: number;
    estimativaRows: number;
  };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
