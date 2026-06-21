/**
 * Character value for CNPJ modulo 11 — ASCII decimal minus 48 (RFB Q14).
 * @see https://www.gov.br/receitafederal/pt-br/centrais-de-conteudo/publicacoes/perguntas-e-respostas/cnpj/cnpj-alfanumerico.pdf
 */
export function cnpjCharValue(char: string): number {
  return char.charCodeAt(0) - 48;
}
