import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runCep, runCepCommand } from '../src/commands/cep.js';
import { CEP_GOLDEN_PRIMARY, CEP_OFFICIAL_SOURCE_URL } from '@br-validators/core';

describe('resolveInput (cep)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runCepCommand', () => {
  it('validates golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCepCommand('validate', CEP_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io)).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCepCommand('validate', CEP_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(CEP_OFFICIAL_SOURCE_URL);
  });

  it('validates quiet invalid', () => {
    expect(runCepCommand('validate', '1234567', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('formats valid CEP', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCepCommand('format', CEP_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('01310-100');
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCepCommand('format', '1234567', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(runCepCommand('format', CEP_GOLDEN_PRIMARY, { json: false, quiet: true, source: false })).toBe(EXIT.OK);
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCepCommand('strip', '01310-100', { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(CEP_GOLDEN_PRIMARY);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runCepCommand('strip', CEP_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(CEP_GOLDEN_PRIMARY);
  });
});

describe('runCep', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runCep('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing CEP');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCep('validate', undefined, { json: false, quiet: true, source: false, file: CEP_GOLDEN_PRIMARY }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runCepCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runCepCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});
