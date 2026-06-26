# Contributing an RG UF validator

> One UF per PR · Label: `good-first-issue`, `rg-uf`  
> Issue template: [.github/ISSUE_TEMPLATE/rg-uf-contribution.md](../../../../.github/ISSUE_TEMPLATE/rg-uf-contribution.md)

## Before coding

1. Cite an **official SSP/IGP walkthrough** (not SEFAZ-IE calculators — those validate Inscrição Estadual, not RG).
2. Ghiorzi documents RG DV only for **SP, RJ, MG** — other states need state-specific sources.
3. Add `tests/vectors/rg.<uf>.official.json` with `source` URL before implementation.

## Files to add or update

| File | Action |
|------|--------|
| `src/core/rg/<uf-lowercase>.ts` | `validateRg<Uf>`, `stripRg<Uf>` |
| `tests/vectors/rg.<uf>.official.json` | Valid + invalid golden vectors |
| `constants.ts` | `RG_SUPPORTED_UFS`, `RG_UF_RULES`, `RG_OFFICIAL_SOURCE_URLS`; remove UF from `RG_PENDING_UFS` |
| `index.ts` | Register in `VALIDATORS` / `STRIPPERS` |
| `docs/OFFICIAL-SOURCES.md` | § RG row |
| `CHANGELOG.md` | `[Unreleased]` UF list |

## API contract (locked)

- `validateRg(raw, { uf })` — UF required
- Unsupported UF → `{ ok: false, code: 'UF_NOT_IMPLEMENTED' }`
- `detect()` does **not** auto-classify RG
- 100% coverage on `packages/br-validators/src/**` — no mocked DV logic
