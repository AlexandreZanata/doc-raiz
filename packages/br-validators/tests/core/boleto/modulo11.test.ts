import { describe, expect, it } from 'vitest';
import { computeModulo11BarcodeDv } from '../../../src/core/boleto/modulo11.js';
import edgeVectors from '../../vectors/boleto.modulo-edge.json';

describe('computeModulo11BarcodeDv edge vectors', () => {
  it.each(edgeVectors.modulo11)('matches $note', ({ digits43, expectedDv }) => {
    expect(computeModulo11BarcodeDv(digits43)).toBe(expectedDv);
  });
});
