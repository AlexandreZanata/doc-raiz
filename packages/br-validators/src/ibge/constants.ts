/**
 * IBGE localities — official Brazilian states and municipalities.
 * @see https://servicodados.ibge.gov.br/api/docs/localidades
 */

export const IBGE_OFFICIAL_DOCS_URL = 'https://servicodados.ibge.gov.br/api/docs/localidades';
export const IBGE_ESTADOS_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
export const IBGE_MUNICIPIOS_URL = 'https://servicodados.ibge.gov.br/api/v1/localidades/municipios';

export const IBGE_EXPECTED_ESTADOS = 27;
export const IBGE_MIN_MUNICIPIOS = 5500;

/** All 27 federative unit siglas — used for UF filter validation. */
export const IBGE_UF_SIGLAS = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MG', 'MS', 'MT',
  'PA', 'PB', 'PE', 'PI', 'PR', 'RJ', 'RN', 'RO', 'RR', 'RS', 'SC', 'SE', 'SP', 'TO',
] as const;

export type IbgeUfSigla = (typeof IBGE_UF_SIGLAS)[number];

export const IBGE_UF_SIGLA_SET: ReadonlySet<string> = new Set(IBGE_UF_SIGLAS);

/** Golden municipality — São Paulo capital (IBGE 3550308). */
export const IBGE_GOLDEN_MUNICIPIO_SP = 3550308;

/** Golden municipality — Sorriso, MT (IBGE 5107925). */
export const IBGE_GOLDEN_MUNICIPIO_SORRISO = 5107925;

/** Golden municipality — Brasília, DF (IBGE 5300108). */
export const IBGE_GOLDEN_MUNICIPIO_BRASILIA = 5300108;

/** Golden state — São Paulo (IBGE 35). */
export const IBGE_GOLDEN_ESTADO_SP = 35;
