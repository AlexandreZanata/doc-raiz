import type { DatasetChanges, DatasetVerification } from '../data-catalog/types.js';

export interface IbgeRegiao {
  id: number;
  nome: string;
}

export interface Estado {
  codigo: number;
  sigla: string;
  nome: string;
  regiao: IbgeRegiao;
}

export interface Municipio {
  codigo: number;
  nome: string;
  uf: string;
}

export interface IbgeDataVersion {
  id: 'ibge';
  nome: string;
  fonte: string;
  endpoints: string[];
  capturadoEm: string;
  atualizadoEm: string;
  contagens: { estados: number; municipios: number };
  alteracoes: DatasetChanges;
  verificacao: DatasetVerification;
  documentacao: string;
}
