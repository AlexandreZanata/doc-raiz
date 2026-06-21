/**
 * Strip CEP mask — digits only (BR-CEP-001).
 * @see https://www.correios.com.br/atendimento/developers/manuais/manual-api-busca-cep
 */
export function stripCep(input: string): string {
  return input.replace(/\D/g, '');
}
