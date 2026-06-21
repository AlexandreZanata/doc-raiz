/**
 * Modulo 11 — código de barras general DV (Anexo X).
 */
export function computeModulo11BarcodeDv(barcodeWithoutDv: string): number {
  let multiplier = 2;
  let sum = 0;

  for (let i = barcodeWithoutDv.length - 1; i >= 0; i--) {
    sum += Number(barcodeWithoutDv[i]) * multiplier;
    multiplier = multiplier >= 9 ? 2 : multiplier + 1;
  }

  const remainder = sum % 11;
  let dv = 11 - remainder;
  if (dv === 0 || dv === 10 || dv === 11) {
    dv = 1;
  }
  return dv;
}
