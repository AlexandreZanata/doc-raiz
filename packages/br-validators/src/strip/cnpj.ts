/**
 * Strip CNPJ mask — preserve A-Z0-9, uppercase (RFB Q21).
 */
export function stripCnpj(input: string): string {
  return input.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}
