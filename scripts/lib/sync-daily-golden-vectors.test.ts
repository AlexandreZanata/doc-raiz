import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { syncPtaxGoldenVectors, syncSelicGoldenVectors } from './sync-daily-golden-vectors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const FIXTURE_ROOT = path.join(__dirname, '../fixtures/sync-daily-golden-vectors');

async function writeJson(relativePath: string, value: object): Promise<string> {
  const filePath = path.join(FIXTURE_ROOT, relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
  return filePath;
}

describe('sync-daily-golden-vectors', () => {
  afterEach(async () => {
    await rm(FIXTURE_ROOT, { recursive: true, force: true });
  });

  it('updates SELIC rolling golden fields from embedded data', async () => {
    const selicPath = await writeJson('selic/selic.json', [
      { data: '2026-04-01', valor: 14.75 },
      { data: '2026-06-29', valor: 14.25 },
    ]);
    const metadataPath = await writeJson('selic/metadata.json', { capturadoEm: '2026-06-29' });
    const vectorsPath = await writeJson('selic/selic.official.json', {
      golden: {
        ultimaMeta: { data: '2026-06-26', valor: 14.25 },
        inicioJanela: { data: '2026-03-29', valor: 14.75 },
        copomJun2026: { data: '2026-06-18', valor: 14.25 },
        antesCopom: { data: '2026-06-17', valor: 14.5 },
      },
      staleness: {
        asOfFresh: '2026-06-26',
        freshReferenceDate: '2026-06-26',
        staleReferenceDate: '2026-06-24',
        capturadoEm: '2026-06-26',
        staleWarning: 'Embedded data. For real-time use @br-validators/adapters-selic',
      },
    });

    const updated = await syncSelicGoldenVectors(selicPath, metadataPath, vectorsPath);
    expect(updated).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      golden: { ultimaMeta: { data: string }; inicioJanela: { data: string } };
      staleness: { capturadoEm: string; freshReferenceDate: string };
    };
    expect(vectors.golden.ultimaMeta.data).toBe('2026-06-29');
    expect(vectors.golden.inicioJanela.data).toBe('2026-04-01');
    expect(vectors.staleness.capturadoEm).toBe('2026-06-29');
    expect(vectors.staleness.freshReferenceDate).toBe('2026-06-29');
  });

  it('updates PTAX último dia útil golden fields from embedded data', async () => {
    const ptaxPath = await writeJson('ptax/ptax.json', [
      {
        moeda: 'USD',
        data: '2026-06-23',
        cotacaoCompra: 5.1737,
        cotacaoVenda: 5.1743,
      },
      {
        moeda: 'USD',
        data: '2026-06-29',
        cotacaoCompra: 5.15,
        cotacaoVenda: 5.151,
      },
      {
        moeda: 'EUR',
        data: '2026-06-29',
        cotacaoCompra: 5.9,
        cotacaoVenda: 5.901,
      },
    ]);
    const metadataPath = await writeJson('ptax/metadata.json', { capturadoEm: '2026-06-29' });
    const vectorsPath = await writeJson('ptax/ptax.official.json', {
      golden: {
        usdUltimoDiaUtil: {
          moeda: 'USD',
          data: '2026-06-26',
          cotacaoCompra: 5.1689,
          cotacaoVenda: 5.1695,
        },
        eurUltimoDiaUtil: {
          moeda: 'EUR',
          data: '2026-06-26',
          cotacaoCompra: 5.8941,
          cotacaoVenda: 5.8953,
        },
        usdHistorico: {
          moeda: 'USD',
          data: '2026-06-23',
          dataBacen: '06-23-2026',
          cotacaoCompra: 5.1737,
          cotacaoVenda: 5.1743,
        },
        historicoRange: {
          moeda: 'USD',
          desde: '2026-06-20',
          ate: '2026-06-26',
          expectedRowCount: 5,
          firstDate: '2026-06-22',
          lastDate: '2026-06-26',
        },
      },
      staleness: {
        asOfFresh: '2026-06-27',
        freshReferenceDate: '2026-06-26',
        staleReferenceDate: '2026-06-23',
        capturadoEm: '2026-06-27',
        staleWarning: 'Embedded data. For real-time use @br-validators/adapters-ptax',
      },
    });

    const updated = await syncPtaxGoldenVectors(ptaxPath, metadataPath, vectorsPath);
    expect(updated).toBe(true);

    const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as {
      golden: { usdUltimoDiaUtil: { data: string; cotacaoCompra: number } };
      staleness: { capturadoEm: string; freshReferenceDate: string };
    };
    expect(vectors.golden.usdUltimoDiaUtil.data).toBe('2026-06-29');
    expect(vectors.golden.usdUltimoDiaUtil.cotacaoCompra).toBe(5.15);
    expect(vectors.staleness.capturadoEm).toBe('2026-06-29');
    expect(vectors.staleness.freshReferenceDate).toBe('2026-06-29');
  });

});
