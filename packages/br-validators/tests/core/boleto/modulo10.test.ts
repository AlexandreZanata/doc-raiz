import { describe, expect, it } from 'vitest';
import { computeModulo10FieldDv } from '../../../src/core/boleto/modulo10.js';
import edgeVectors from '../../vectors/boleto.modulo-edge.json';

describe('computeModulo10FieldDv edge vectors', () => {
  it.each(edgeVectors.modulo10)('matches $note', ({ digits, expectedDv }) => {
    expect(computeModulo10FieldDv(digits)).toBe(expectedDv);
  });
});
