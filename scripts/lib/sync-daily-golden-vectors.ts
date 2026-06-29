import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

interface SelicObservacao {
  data: string;
  valor: number;
}

interface SelicOfficialVectors {
  golden: {
    ultimaMeta: { data: string; valor: number };
    inicioJanela: { data: string; valor: number };
    copomJun2026: { data: string; valor: number };
    antesCopom: { data: string; valor: number };
  };
  staleness: {
    asOfFresh: string;
    freshReferenceDate: string;
    staleReferenceDate: string;
    capturadoEm: string;
    staleWarning: string;
  };
}

interface PtaxCotacao {
  moeda: string;
  data: string;
  cotacaoCompra: number;
  cotacaoVenda: number;
}

interface PtaxOfficialVectors {
  golden: {
    usdUltimoDiaUtil: PtaxCotacao;
    eurUltimoDiaUtil: PtaxCotacao;
    usdHistorico: PtaxCotacao & { dataBacen: string };
    historicoRange: {
      moeda: string;
      desde: string;
      ate: string;
      expectedRowCount: number;
      firstDate: string;
      lastDate: string;
    };
  };
  staleness: {
    asOfFresh: string;
    freshReferenceDate: string;
    staleReferenceDate: string;
    capturadoEm: string;
    staleWarning: string;
  };
}

function pickLatestByMoeda(
  records: readonly PtaxCotacao[],
  moeda: string,
): PtaxCotacao | undefined {
  const normalized = moeda.toUpperCase();
  return records
    .filter((row) => row.moeda.toUpperCase() === normalized)
    .sort((left, right) => right.data.localeCompare(left.data))[0];
}

function resolveStaleReferenceDate(
  records: readonly { data: string }[],
  freshDate: string,
  currentStale: string,
): string {
  const dates = new Set(records.map((row) => row.data));
  if (dates.has(currentStale) && currentStale < freshDate) {
    return currentStale;
  }

  const older = records
    .map((row) => row.data)
    .filter((date) => date < freshDate)
    .sort((left, right) => right.localeCompare(left));

  return older[0] ?? currentStale;
}

export async function syncSelicGoldenVectors(
  selicPath: string,
  metadataPath: string,
  vectorsPath: string,
): Promise<boolean> {
  const selic = JSON.parse(await readFile(selicPath, 'utf8')) as SelicObservacao[];
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as { capturadoEm: string };
  const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as SelicOfficialVectors;

  if (selic.length === 0) {
    return false;
  }

  const first = selic[0];
  const latest = selic[selic.length - 1];
  const next: SelicOfficialVectors = {
    ...vectors,
    golden: {
      ...vectors.golden,
      ultimaMeta: { data: latest.data, valor: latest.valor },
      inicioJanela: { data: first.data, valor: first.valor },
    },
    staleness: {
      ...vectors.staleness,
      asOfFresh: metadata.capturadoEm,
      freshReferenceDate: latest.data,
      capturadoEm: metadata.capturadoEm,
      staleReferenceDate: resolveStaleReferenceDate(
        selic,
        latest.data,
        vectors.staleness.staleReferenceDate,
      ),
    },
  };

  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  const previous = `${JSON.stringify(vectors, null, 2)}\n`;
  if (serialized === previous) {
    return false;
  }

  await writeFile(vectorsPath, serialized);
  return true;
}

export async function syncPtaxGoldenVectors(
  ptaxPath: string,
  metadataPath: string,
  vectorsPath: string,
): Promise<boolean> {
  const ptax = JSON.parse(await readFile(ptaxPath, 'utf8')) as PtaxCotacao[];
  const metadata = JSON.parse(await readFile(metadataPath, 'utf8')) as { capturadoEm: string };
  const vectors = JSON.parse(await readFile(vectorsPath, 'utf8')) as PtaxOfficialVectors;

  const usdLatest = pickLatestByMoeda(ptax, 'USD');
  const eurLatest = pickLatestByMoeda(ptax, 'EUR');
  if (usdLatest === undefined || eurLatest === undefined) {
    return false;
  }

  const range = vectors.golden.historicoRange;
  const rangeRows = ptax
    .filter(
      (row) =>
        row.moeda === 'USD' && row.data >= range.desde && row.data <= usdLatest.data,
    )
    .sort((left, right) => left.data.localeCompare(right.data));

  const next: PtaxOfficialVectors = {
    ...vectors,
    golden: {
      ...vectors.golden,
      usdUltimoDiaUtil: {
        moeda: usdLatest.moeda,
        data: usdLatest.data,
        cotacaoCompra: usdLatest.cotacaoCompra,
        cotacaoVenda: usdLatest.cotacaoVenda,
      },
      eurUltimoDiaUtil: {
        moeda: eurLatest.moeda,
        data: eurLatest.data,
        cotacaoCompra: eurLatest.cotacaoCompra,
        cotacaoVenda: eurLatest.cotacaoVenda,
      },
      historicoRange: {
        ...range,
        ate: usdLatest.data,
        expectedRowCount: rangeRows.length,
        firstDate: rangeRows[0]?.data ?? range.firstDate,
        lastDate: usdLatest.data,
      },
    },
    staleness: {
      ...vectors.staleness,
      asOfFresh: metadata.capturadoEm,
      freshReferenceDate: usdLatest.data,
      capturadoEm: metadata.capturadoEm,
      staleReferenceDate: resolveStaleReferenceDate(
        ptax.filter((row) => row.moeda === 'USD'),
        usdLatest.data,
        vectors.staleness.staleReferenceDate,
      ),
    },
  };

  const serialized = `${JSON.stringify(next, null, 2)}\n`;
  const previous = `${JSON.stringify(vectors, null, 2)}\n`;
  if (serialized === previous) {
    return false;
  }

  await writeFile(vectorsPath, serialized);
  return true;
}

export interface DailyGoldenVectorPaths {
  rootDir: string;
}

export async function syncDailyGoldenVectors(paths: DailyGoldenVectorPaths): Promise<{
  selicUpdated: boolean;
  ptaxUpdated: boolean;
}> {
  const coreData = path.join(paths.rootDir, 'packages/br-validators');
  const vectorsDir = path.join(coreData, 'tests/vectors');

  const selicUpdated = await syncSelicGoldenVectors(
    path.join(coreData, 'src/selic/data/selic.json'),
    path.join(coreData, 'src/selic/data/metadata.json'),
    path.join(vectorsDir, 'selic.official.json'),
  );

  const ptaxUpdated = await syncPtaxGoldenVectors(
    path.join(coreData, 'src/ptax/data/ptax.json'),
    path.join(coreData, 'src/ptax/data/metadata.json'),
    path.join(vectorsDir, 'ptax.official.json'),
  );

  return { selicUpdated, ptaxUpdated };
}
