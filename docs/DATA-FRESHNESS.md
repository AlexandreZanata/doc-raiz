# Data freshness — reference datasets

> **Auto-generated** by `scripts/data-refresh-bot.ts` — do not edit manually.
> Last bot run: 2026-06-23T14:39:41.963Z

## Summary

| Dataset | Last capture | Records | + added | − removed | ~ changed | Official source |
|---------|--------------|---------|---------|-----------|-----------|-----------------|
| IBGE Localidades | 2026-06-23 | 27 estados / 5571 municipios | 5598 | 0 | 0 | [IBGE API v1 /localidades](https://servicodados.ibge.gov.br/api/v1/localidades/estados) |
| Bacen STR Participants | 2026-06-23 | 468 bancos | 468 | 0 | 0 | [Banco Central — Participantes STR](https://www.bcb.gov.br/content/estabilidadefinanceira/str1/ParticipantesSTR.csv) |
| Anatel DDD Geographic Lookup | 2026-06-23 | 67 ddds | 67 | 0 | 0 | [Anatel Plano de Numeração + IBGE municipios](https://informacoes.anatel.gov.br/paineis/areas-tarifarias/codigos-nacionais) |

## Verification

- Schedule: weekly — Monday 06:00 UTC (`data-refresh-bot.yml`)
- Local dry run: `pnpm data:refresh`
- Library API: `getDataCatalog()` from `@br-validators/core/data-catalog`

## Report snapshot

```json
{
  "datasetsVerificados": 3,
  "datasetsAlterados": 3,
  "totalAdicionados": 6133,
  "totalRemovidos": 0,
  "totalAlterados": 0
}
```

