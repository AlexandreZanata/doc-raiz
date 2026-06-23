import { describe, expect, it } from 'vitest';

import {
  DATA_CATALOG_VERSION,
  DATASET_REGISTRY,
  getDataCatalog,
  getDatasetMetadata,
} from '../../../src/data-catalog/index.js';
import vectors from '../../vectors/ibge.official.json';

describe('Data catalog — transparency API', () => {
  it('lists registered datasets including IBGE, bancos, and telefone-ddd', () => {
    const catalog = getDataCatalog();
    expect(catalog.length).toBeGreaterThanOrEqual(3);
    expect(catalog.some((entry) => entry.id === 'ibge')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'bancos')).toBe(true);
    expect(catalog.some((entry) => entry.id === 'telefone-ddd')).toBe(true);
  });

  it('resolves IBGE metadata by id', () => {
    const ibge = getDatasetMetadata('ibge');
    expect(ibge?.nome).toBe('IBGE Localidades');
    expect(ibge?.endpoints).toContain(vectors.estadosUrl);
    expect(ibge?.alteracoes.adicionados).toEqual(expect.any(Number));
    expect(ibge?.alteracoes.removidos).toEqual(expect.any(Number));
    expect(ibge?.alteracoes.alterados).toEqual(expect.any(Number));
  });

  it('returns undefined for unknown dataset id', () => {
    expect(getDatasetMetadata('unknown-dataset')).toBeUndefined();
  });

  it('exposes catalog version with registry count', () => {
    expect(DATA_CATALOG_VERSION.totalDatasets).toBe(DATASET_REGISTRY.length);
    expect(DATA_CATALOG_VERSION.totalDatasets).toBe(getDataCatalog().length);
  });
});
