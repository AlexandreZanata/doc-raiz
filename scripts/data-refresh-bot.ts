import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { spawn } from 'node:child_process';

import { exitWithError } from './lib/errors.js';
import { parseDatasetMetadata } from './lib/parse-metadata.js';
import {
  generateDataFreshnessDoc,
  generatePrBody,
  type RefreshReport,
  type RefreshReportDataset,
} from './lib/report-markdown.js';
import type { DatasetMetadata } from '../packages/br-validators/src/data-catalog/types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const DATASET_METADATA_PATHS = [
  path.join(ROOT, 'packages/br-validators/src/ibge/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/bancos/data/metadata.json'),
  path.join(ROOT, 'packages/br-validators/src/core/telefone/data/ddd-metadata.json'),
] as const;

const FETCH_SCRIPTS = [
  'scripts/fetch-ibge.ts',
  'scripts/fetch-bancos.ts',
  'scripts/fetch-ddd.ts',
] as const;

const REPORT_DIR = path.join(ROOT, 'data/refresh-reports');
const FRESHNESS_DOC = path.join(ROOT, 'docs/DATA-FRESHNESS.md');

interface CliOptions {
  fetchOnly: boolean;
  reportOnly: boolean;
  dryRun: boolean;
}

function parseArgs(argv: string[]): CliOptions {
  return {
    fetchOnly: argv.includes('--fetch-only'),
    reportOnly: argv.includes('--report-only'),
    dryRun: argv.includes('--dry-run'),
  };
}

function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', shell: false });
    child.on('error', reject);
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} exited with code ${String(code ?? 'unknown')}`));
      }
    });
  });
}

async function readAllMetadata(): Promise<DatasetMetadata[]> {
  const datasets: DatasetMetadata[] = [];
  for (const metadataPath of DATASET_METADATA_PATHS) {
    const raw = await readFile(metadataPath, 'utf8');
    datasets.push(parseDatasetMetadata(raw));
  }
  return datasets;
}

async function writeReports(dryRun: boolean): Promise<RefreshReport> {
  const datasets = await readAllMetadata();

  const datasetEntries: RefreshReportDataset[] = datasets.map((metadata) => {
    const changed =
      metadata.alteracoes.adicionados > 0 ||
      metadata.alteracoes.removidos > 0 ||
      metadata.alteracoes.alterados > 0;
    return {
      id: metadata.id,
      status: changed ? 'changed' : 'unchanged',
      alteracoes: metadata.alteracoes,
      contagens: metadata.contagens,
    };
  });

  const report: RefreshReport = {
    executadoEm: new Date().toISOString(),
    agendamento: 'semanal',
    datasets: datasetEntries,
    resumo: {
      datasetsVerificados: datasets.length,
      datasetsAlterados: datasetEntries.filter((entry) => entry.status === 'changed').length,
      totalAdicionados: datasetEntries.reduce((sum, entry) => sum + entry.alteracoes.adicionados, 0),
      totalRemovidos: datasetEntries.reduce((sum, entry) => sum + entry.alteracoes.removidos, 0),
      totalAlterados: datasetEntries.reduce((sum, entry) => sum + entry.alteracoes.alterados, 0),
    },
  };

  if (dryRun) {
    console.log('Dry run — report:', JSON.stringify(report, null, 2));
    return report;
  }

  await mkdir(REPORT_DIR, { recursive: true });

  await writeFile(path.join(REPORT_DIR, 'latest.json'), `${JSON.stringify(report, null, 2)}\n`);
  await writeFile(path.join(REPORT_DIR, 'pr-body.md'), generatePrBody(report, datasets));
  await writeFile(FRESHNESS_DOC, generateDataFreshnessDoc(report, datasets));

  return report;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.reportOnly) {
    for (const script of FETCH_SCRIPTS) {
      await runCommand('pnpm', ['exec', 'tsx', script]);
    }
  }

  const report = await writeReports(options.dryRun);

  if (report.resumo.datasetsAlterados === 0) {
    console.log('No dataset drift detected.');
  } else {
    console.log(
      `Dataset drift detected: +${String(report.resumo.totalAdicionados)} −${String(report.resumo.totalRemovidos)} ~${String(report.resumo.totalAlterados)}`,
    );
  }
}

main().catch(exitWithError);
