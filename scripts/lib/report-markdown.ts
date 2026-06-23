import type { DatasetMetadata } from './metadata-writer.js';

export interface RefreshReportDataset {
  id: string;
  status: 'changed' | 'unchanged';
  alteracoes: DatasetMetadata['alteracoes'];
  contagens: Record<string, number>;
}

export interface RefreshReport {
  executadoEm: string;
  agendamento: 'semanal';
  datasets: RefreshReportDataset[];
  resumo: {
    datasetsVerificados: number;
    datasetsAlterados: number;
    totalAdicionados: number;
    totalRemovidos: number;
    totalAlterados: number;
  };
}

export function generateDataFreshnessDoc(report: RefreshReport, datasets: DatasetMetadata[]): string {
  const lines: string[] = [
    '# Data freshness — reference datasets',
    '',
    '> **Auto-generated** by `scripts/data-refresh-bot.ts` — do not edit manually.',
    `> Last bot run: ${report.executadoEm}`,
    '',
    '## Summary',
    '',
    '| Dataset | Last capture | Records | + added | − removed | ~ changed | Official source |',
    '|---------|--------------|---------|---------|-----------|-----------|-----------------|',
  ];

  for (const dataset of datasets) {
    const counts = Object.entries(dataset.contagens)
      .map(([key, value]) => `${String(value)} ${key}`)
      .join(' / ');
    const source = dataset.endpoints[0] ?? dataset.fonte;
    const { adicionados, removidos, alterados } = dataset.alteracoes;
    lines.push(
      `| ${dataset.nome} | ${dataset.capturadoEm} | ${counts} | ${String(adicionados)} | ${String(removidos)} | ${String(alterados)} | [${dataset.fonte}](${source}) |`,
    );
  }

  lines.push(
    '',
    '## Verification',
    '',
    '- Schedule: weekly — Monday 06:00 UTC (`data-refresh-bot.yml`)',
    '- Local dry run: `pnpm data:refresh`',
    '- Library API: `getDataCatalog()` from `@br-validators/core/data-catalog`',
    '',
    '## Report snapshot',
    '',
    '```json',
    JSON.stringify(report.resumo, null, 2),
    '```',
    '',
  );

  return `${lines.join('\n')}\n`;
}

export function generatePrBody(report: RefreshReport, datasets: DatasetMetadata[]): string {
  const lines: string[] = [
    `## Weekly data refresh — ${report.executadoEm.slice(0, 10)}`,
    '',
    '| Dataset | Records | + added | − removed | ~ changed | Captured | Source |',
    '|---------|---------|---------|-----------|-----------|----------|--------|',
  ];

  for (const dataset of datasets) {
    const counts = Object.entries(dataset.contagens)
      .map(([key, value]) => `${String(value)} ${key}`)
      .join(' / ');
    const source = dataset.endpoints[0] ?? '#';
    const { adicionados, removidos, alterados } = dataset.alteracoes;
    lines.push(
      `| ${dataset.id} | ${counts} | ${String(adicionados)} | ${String(removidos)} | ${String(alterados)} | ${dataset.capturadoEm} | [official](${source}) |`,
    );
  }

  lines.push(
    '',
    '### Verification',
    '',
    '- [ ] `pnpm verify` passed',
    '- [ ] All endpoints are official government domains',
    '- [ ] Human review required before merge',
    '',
    `**Totals:** +${String(report.resumo.totalAdicionados)} −${String(report.resumo.totalRemovidos)} ~${String(report.resumo.totalAlterados)}`,
    '',
  );

  return lines.join('\n');
}
