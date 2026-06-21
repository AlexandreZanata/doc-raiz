# br-validators

100% open-source Brazilian document validators (MIT).

## CNPJ (Phase 1)

Algorithm source: [RFB CNPJ alfanumérico PDF Q14](https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf)

Golden vector: `12ABC34501DE35` → `12.ABC.345/01DE-35`

```typescript
import {
  validateCnpj,
  formatCnpj,
  stripCnpj,
  isValidCnpjNumeric,
  isValidCnpjAlphanumeric,
} from 'br-validators';
```

## Test

```bash
pnpm test:coverage   # 100% coverage required
```
