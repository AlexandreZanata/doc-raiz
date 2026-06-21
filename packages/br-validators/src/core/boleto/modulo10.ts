/**
 * Modulo 10 — linha digitável field DVs (Anexo IX).
 */
export function computeModulo10FieldDv(digits: string): number {
  let multiplier = 2;
  let sum = 0;

  for (let i = digits.length - 1; i >= 0; i--) {
    let product = Number(digits[i]) * multiplier;
    if (product > 9) {
      product = Math.floor(product / 10) + (product % 10);
    }
    sum += product;
    multiplier = multiplier === 2 ? 1 : 2;
  }

  const remainder = sum % 10;
  return remainder === 0 ? 0 : 10 - remainder;
}
