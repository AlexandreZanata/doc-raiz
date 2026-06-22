import type { GeneratableDocumentType } from '@br-validators/core';

export type PlatformGeneratableEntry = {
  value: GeneratableDocumentType;
  label: string;
  formats?: readonly string[];
  ufSelector?: boolean;
  brandSelector?: boolean;
};

/** Core `generate()` types exposed on the platform Generate page. */
export const PLATFORM_GENERATABLE: readonly PlatformGeneratableEntry[] = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ', formats: ['numeric', 'alphanumeric'] },
  { value: 'cep', label: 'CEP' },
  { value: 'telefone', label: 'Telefone', formats: ['celular', 'fixo'] },
  { value: 'placa', label: 'Placa', formats: ['mercosul', 'legacy'] },
  { value: 'pis-pasep', label: 'PIS/PASEP' },
  { value: 'cnh', label: 'CNH' },
  { value: 'renavam', label: 'RENAVAM' },
  { value: 'inscricao-estadual', label: 'Inscrição Estadual (IE)', ufSelector: true },
  { value: 'titulo-eleitor', label: 'Título de Eleitor', ufSelector: true },
  {
    value: 'cartao-credito',
    label: 'Cartão de Crédito',
    formats: ['visa', 'mastercard', 'amex', 'elo', 'hipercard'],
    brandSelector: true,
  },
] as const;

export function findPlatformGeneratable(type: GeneratableDocumentType): PlatformGeneratableEntry | undefined {
  return PLATFORM_GENERATABLE.find((item) => item.value === type);
}
