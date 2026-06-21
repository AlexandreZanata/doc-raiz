# Inscrição Estadual — state algorithm index

> **No federal single norm.** Each UF (27) defines length, prefix, weights, and modulo rules.  
> **Historic consolidated reference:** [SINTEGRA `insc_est.html`](http://www.sintegra.gov.br/insc_est.html) + [`Cad_Estados/cad_XX.html`](http://www.sintegra.gov.br/Cad_Estados/) — portal discontinued; pages still mirror SEFAZ roteiros.  
> **Library delivery:** state-by-state phases — see [ROADMAP.md](ROADMAP.md).

Last reviewed: June 2026.

---

## Implementation status

| UF | Digits | DVs | Modulo | Status | Primary source |
|----|--------|-----|--------|--------|----------------|
| **SP** | 12 | 2 (pos 9, 12) | 11 (custom remainder) | **Phase 8 v1** | [SEFAZ-SP Sintegra rotina](https://portal.fazenda.sp.gov.br/servicos/icms/Paginas/sintegra-rotina-consistencia.aspx) |
| **MT** | 9 (canonical) / 11 (legacy pad) | 1 | 11 | **Phase 8 v1** | [SEFAZ-MT Port. Art. 6º](https://app1.sefaz.mt.gov.br/Sistema/legislacao/legislacaotribut.nsf/709f9c981a9d9f468425671300482be0/2217ddcf7a9b7cea03258c6c007324ba?OpenDocument=) · [SINTEGRA MT](http://www.sintegra.gov.br/Cad_Estados/cad_MT.html) |
| **DF** | 13 | 2 (pos 12, 13) | 11 | **Phase 8 v1** | [Receita DF / CF/DF](https://www.receita.fazenda.df.gov.br/) · [SINTEGRA DF](http://www.sintegra.gov.br/Cad_Estados/cad_DF.html) |
| AC | 13 | 1 | 11 | Planned | SINTEGRA `cad_AC.html` |
| AL | 9 | 1 | 11 | Planned | SINTEGRA `cad_AL.html` |
| AM | 9 | 1 | 11 | Planned | SINTEGRA `cad_AM.html` |
| AP | 9 | 1 | 11 | Planned | SINTEGRA `cad_AP.html` |
| BA | 8–9 | 1 | 11 | Planned | SINTEGRA `cad_BA.html` |
| CE | 9 | 1 | 11 | Planned | SINTEGRA `cad_CE.html` |
| ES | 9 | 1 | 11 | Planned | SINTEGRA `cad_ES.html` |
| GO | 9 | 1 | 11 | Planned | SINTEGRA `cad_GO.html` |
| MA | 9 | 1 | 11 | Planned | SINTEGRA `cad_MA.html` |
| MG | 13 | 1 | 11 (alt.) | Planned | SINTEGRA `cad_MG.html` |
| MS | 9 | 1 | 11 | Planned | SINTEGRA `cad_MS.html` |
| PA | 9 | 1 | 11 | Planned | SINTEGRA `cad_PA.html` |
| PB | 9 | 1 | 11 | Planned | SINTEGRA `cad_PB.html` |
| PE | 9 | 1 | 11 | Planned | SINTEGRA `cad_PE.html` |
| PI | 9 | 1 | 11 | Planned | SINTEGRA `cad_PI.html` |
| PR | 10 | 1 | 11 | Planned | SINTEGRA `cad_PR.html` |
| RJ | 8 | 1 | 11 | Planned | SINTEGRA `cad_RJ.html` |
| RN | 9 | 1 | 11 | Planned | SINTEGRA `cad_RN.html` |
| RO | 14 | 1 | 11 | Planned | SINTEGRA `cad_RO.html` |
| RR | 9 | 1 | 11 | Planned | SINTEGRA `cad_RR.html` |
| RS | 10 | 1 | 11 | Planned | SINTEGRA `cad_RS.html` |
| SC | 9 | 1 | 11 | Planned | SINTEGRA `cad_SC.html` |
| SE | 9 | 1 | 11 | Planned | SINTEGRA `cad_SE.html` |
| TO | 9 | 1 | 11 | Planned | SINTEGRA `cad_TO.html` |

> Digit counts reflect common SINTEGRA roteiros. Some states issue variable lengths by taxpayer class (e.g. SP rural `P…`). Verify against live SEFAZ before shipping each UF.

---

## Phase 8 v1 — algorithm summary (SP, MT, DF)

### São Paulo (SP)

| Field | Value |
|-------|-------|
| Golden | `110042490114` |
| Mask | `XXX.XXX.XXX.XXX` |
| DV1 weights (pos 1–8) | `1, 3, 4, 5, 6, 7, 8, 10` |
| DV2 weights (pos 1–11) | `3, 2, 10, 9, 8, 7, 6, 5, 4, 3, 2` |
| Remainder rule | `R = sum % 11`; DV = rightmost digit of `R`; if `R = 10` → DV = `0` |

### Mato Grosso (MT)

| Field | Value |
|-------|-------|
| Golden (legacy) | `00130000019` |
| Canonical | `13` + 6 sequential + DV (9 digits) |
| Legacy pad | 11 digits, zero-fill left |
| Weights (pos 1–10) | `3, 2, 9, 8, 7, 6, 5, 4, 3, 2` |
| Remainder rule | `R = sum % 11`; if `R ≤ 1` → DV = `0`; else DV = `11 − R` |

### Distrito Federal (DF)

| Field | Value |
|-------|-------|
| Golden | `0730000100109` |
| Mask | `073.XXXXX.XXX-XX` |
| Prefix | `07` (fixed) |
| DV1 weights (pos 1–11) | `4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2` |
| DV2 weights | `5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2` (+ DV1×2) |
| Remainder rule | if `R ≤ 1` → DV = `0`; else DV = `11 − R` |

---

## Known cross-system pitfalls

| Topic | Detail |
|-------|--------|
| DF 12 vs 13 digits | Legacy SINTEGRA validators (Convênio 57/95) expected 12 digits; CF/DF today uses **13**. Prefer 13-digit validation. |
| MT 9 vs 11 digits | CCE/MT Art. 6º defines 9-digit IDs; file-transfer tools still zero-pad to 11. |
| SP rural IE | `P0MMMSSSSD000` (13 chars) — separate from industrial/commercial 12-digit rule. |
| SINTEGRA discontinuation | Algorithm pages may return 403; mirror content in phase `OFFICIAL-REFERENCE.md` + golden vectors. |

---

## Verification protocol (per UF)

1. Cite primary SEFAZ URL in [OFFICIAL-SOURCES.md](OFFICIAL-SOURCES.md).
2. Add golden vector in `tests/vectors/ie.{uf}.official.json` from official walkthrough or worked example.
3. Implement validator **before** expanding to next UF.
4. Cross-check with independent open-source implementation only after primary source satisfied.

---

## References

- Phase 8 tasks: `.local/phases/08-inscricao-estadual/TASKS.md`
- Algorithm extracts: `.local/phases/08-inscricao-estadual/OFFICIAL-REFERENCE.md`
- Glossary: [GLOSSARY.md](GLOSSARY.md#inscrição-estadual-ie)
