# Adapter RFC — `@br-validators/adapters-pncp`

> **Status:** RFC (not implemented in core)  
> **Core embed:** `@br-validators/core/pncp-reference` — static domain tables only

---

## Scope

| Operation | Delivery |
|-----------|----------|
| Modalidade / amparo legal lookup | `@br-validators/core/pncp-reference` (embedded) |
| Contract search by CNPJ | Adapter — paginated live API |
| Contratação by org/year/sequencial | Adapter — live API |

---

## API surface (Consulta)

- Base: `https://pncp.gov.br/api/consulta`
- OpenAPI: https://pncp.gov.br/api/consulta/v3/api-docs

---

## Requirements

1. Normalize CNPJ with `@br-validators/core/cnpj` `stripCnpj` before query.
2. Respect PNCP rate limits — cache responses with TTL; exponential backoff on 429/5xx.
3. Paginate with `pagina` / `tamanhoPagina` — never assume single-page results.
4. Log request metadata only — redact contractor CNPJ in production logs (mask middle digits).
5. Human confirmation before persisting query results in agentic workflows (ASI rule).

---

**Updated:** 2026-06-23
