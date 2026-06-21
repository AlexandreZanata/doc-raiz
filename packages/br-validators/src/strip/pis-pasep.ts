/**
 * Strip PIS/PASEP mask — digits only (BR-PIS-002).
 * @see https://www.gov.br/caixa/pt-br/atendimento/beneficios/pis
 */
export function stripPisPasep(input: string): string {
  return input.replace(/\D/g, '');
}
