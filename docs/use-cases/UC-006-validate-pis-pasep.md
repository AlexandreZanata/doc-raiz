# Use Case: UC-006 — Validate and format PIS/PASEP

## Metadata

| Field | Value |
|-------|-------|
| ID | UC-006 |
| Actor | Application developer / end-user form |
| Status | Approved |

## Preconditions

- Input may contain mask characters (`.` `-`) or be raw digits
- PIS, PASEP, NIS, and NIT share the same 11-digit algorithm

## Main flow (happy path)

1. Consumer calls `stripPisPasep(input)` → 11 digits
2. Consumer calls `validatePisPasep(stripped)` → `{ ok: true, value: '10027230888' }`
3. Consumer calls `formatPisPasep(stripped)` → `{ ok: true, formatted: '100.27230.88-8' }`

## Alternate flows

### AF-1: Invalid check digit

- **When:** Modulo 11 fails
- **Then:** `{ ok: false, code: 'INVALID_CHECK_DIGIT' }`

### AF-2: Known invalid pattern

- **When:** All digits identical
- **Then:** `{ ok: false, code: 'KNOWN_INVALID_PATTERN' }`

### AF-3: Wrong length after strip

- **When:** Length ≠ 11
- **Then:** `{ ok: false, code: 'INVALID_LENGTH' }`

## Business rules applied

| Rule ID | Description |
|---------|-------------|
| BR-PIS-001 | Length check |
| BR-PIS-002 | Numeric only |
| BR-PIS-003 | Reject all-same-digit |
| BR-PIS-004 | Modulo 11 |
| BR-PIS-005 | Official weights |
| BR-PIS-006 | Official mask |
| BR-GLOBAL-001 | Strip first |
| BR-GLOBAL-002 | Validate before format |

## Domain events raised

None — pure library, no events.

## Authorization

N/A — client-side/server-side library call.

## Out of scope

- CNIS / eSocial HTTP lookup
- Distinguishing PIS vs PASEP vs NIS by number range

## Golden vectors

| Canonical | Masked | Source |
|-----------|--------|--------|
| `10027230888` | `100.27230.88-8` | [Caixa PIS portal](https://www.gov.br/caixa/pt-br/atendimento/beneficios/pis) |
| `12056456402` | `120.56456.40-2` | Algorithm cross-check |

## Official source

https://www.gov.br/caixa/pt-br/atendimento/beneficios/pis
