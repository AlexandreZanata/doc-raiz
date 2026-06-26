# Migration guide — br-validators v1.x → v2.0

> **Status:** Scaffold (phase 33p) — expanded as v2.0 approaches.  
> **Baseline:** `@br-validators/*@1.8.3` · lookup `LookupResult` shipped in v1.9 (33i).

---

## Overview

v2.0 removes deprecated aliases and tightens lookup ergonomics. Until v2.0, **v1.x `get*PorCodigo` helpers remain** and return `undefined` on any failure.

---

## Lookup APIs (33i)

### v1.x behavior (unchanged until v2.0)

```typescript
import { getNcmPorCodigo } from '@br-validators/core/ncm';

const row = getNcmPorCodigo('12011000'); // Ncm | undefined
```

- Empty, malformed, or missing codes → `undefined`
- No distinction between invalid input and not found

### v1.9+ structured lookups (recommended for new code)

```typescript
import { lookupNcmPorCodigo } from '@br-validators/core/ncm';
import type { LookupResult } from '@br-validators/core/lookup';

const result: LookupResult<Ncm> = lookupNcmPorCodigo('12011000');

if (result.ok) {
  console.log(result.value.descricao);
} else {
  // result.code: 'NOT_FOUND' | 'INVALID_FORMAT' | 'INVALID_INPUT'
  console.error(result.message);
}
```

| Code | Meaning |
|------|---------|
| `INVALID_INPUT` | Empty / whitespace-only input |
| `INVALID_FORMAT` | Normalized shape fails module rules (length, regex, UF set, …) |
| `NOT_FOUND` | Valid key not present in embedded table |

### `get*` compatibility shim

Every migrated module keeps:

```typescript
export function getNcmPorCodigo(codigo: string): Ncm | undefined {
  return unwrapLookupValue(lookupNcmPorCodigo(codigo));
}
```

`unwrapLookupValue` returns `undefined` for **any** failure — preserves v1.x semantics.

### v2.0 breaking plan (draft)

| v1.9 (now) | v2.0 (planned) |
|------------|----------------|
| `getNcmPorCodigo` → `undefined` | **Removed** — use `lookupNcmPorCodigo` |
| `getNcms()` deprecated alias | **Removed** — use `getAllNcm()` |
| CLI lookup JSON failure: stderr only | JSON `{ ok: false, code, message }` on stdout (v1.9+) |

### Module coverage

All offline lookup modules expose `lookup*` returning `LookupResult<T>`:

- Fiscal: NCM, CFOP, CNAE, CBO, CEST, NBS, CST (4 taxes), LC 116, eSocial
- Financial / trade: bancos, moedas, países Bacen, incoterms, portos, aeroportos
- Registry: natureza jurídica, IBGE municípios, TSE cross-walk, PNCP reference, IBPT, Simples Nacional, ANP combustíveis, CNPJ motivos

`search*` functions are **unchanged** — still return `T[]` (empty array = no match).

### CLI

```bash
# Human mode — errors on stderr with message
br-validators ncm lookup 99999999

# JSON mode — structured failure on stdout
br-validators ncm lookup 99999999 --json
# {"ok":false,"code":"NOT_FOUND","message":"NCM 99999999 not in embedded table"}
```

---

## Other v2.0 removals (preview)

See phase [33h](../.local/phases/33-post-v183-maturity/33h-lookup-getall/README.md) for deprecated `getAll*` alias removals.

Full v2.0 checklist: `.local/phases/33-post-v183-maturity/33p-migration-guide/TASKS.md`

---

## Upgrade steps

1. Stay on v1.9.x — no breaking changes to existing `get*` callers.
2. Adopt `lookup*` where you need `INVALID_FORMAT` vs `NOT_FOUND` UX.
3. Update CLI integrations parsing JSON to handle `{ ok: false, code, message }`.
4. Before v2.0: replace `get*PorCodigo` with `lookup*` + explicit handling; remove deprecated `getNcms`-style aliases.

---

## References

- [docs/LIBRARY-API.md](docs/LIBRARY-API.md) — `LookupResult` section
- [CHANGELOG.md](CHANGELOG.md) — Unreleased / v1.9 notes
