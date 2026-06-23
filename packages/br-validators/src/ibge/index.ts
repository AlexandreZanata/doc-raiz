export {
  getEstados,
  getMunicipios,
  getMunicipioPorCodigo,
} from './lookup.js';
export {
  IBGE_ESTADOS_URL,
  IBGE_EXPECTED_ESTADOS,
  IBGE_GOLDEN_ESTADO_SP,
  IBGE_GOLDEN_MUNICIPIO_BRASILIA,
  IBGE_GOLDEN_MUNICIPIO_SORRISO,
  IBGE_GOLDEN_MUNICIPIO_SP,
  IBGE_MIN_MUNICIPIOS,
  IBGE_MUNICIPIOS_URL,
  IBGE_OFFICIAL_DOCS_URL,
  IBGE_UF_SIGLAS,
} from './constants.js';
export type { Estado, IbgeDataVersion, IbgeRegiao, Municipio } from './types.js';
export { IBGE_DATA_VERSION } from './version.js';
