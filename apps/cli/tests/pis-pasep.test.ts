import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, runPisPasep, runPisPasepCommand } from '../src/commands/pis-pasep.js';
import { PIS_PASEP_GOLDEN_PRIMARY, PIS_PASEP_OFFICIAL_SOURCE_URL } from '@br-validators/core';

describe('resolveInput (pis-pasep)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('runPisPasepCommand', () => {
  it('validates golden vector', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPisPasepCommand('validate', PIS_PASEP_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toContain('valid: yes');
  });

  it('validates with json and source', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPisPasepCommand('validate', PIS_PASEP_GOLDEN_PRIMARY, { json: true, quiet: false, source: true }, io);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; source?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(PIS_PASEP_OFFICIAL_SOURCE_URL);
  });

  it('validates quiet invalid', () => {
    expect(runPisPasepCommand('validate', 'bad', { json: false, quiet: true, source: false })).toBe(EXIT.INVALID);
  });

  it('formats valid PIS/PASEP', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPisPasepCommand('format', PIS_PASEP_GOLDEN_PRIMARY, { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe('100.27230.88-8');
  });

  it('formats with json error', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPisPasepCommand('format', 'bad', { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('formats quiet', () => {
    expect(runPisPasepCommand('format', PIS_PASEP_GOLDEN_PRIMARY, { json: false, quiet: true, source: false })).toBe(
      EXIT.OK,
    );
  });

  it('strips input', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPisPasepCommand('strip', '100.27230.88-8', { json: false, quiet: false, source: false }, io);
    expect(io.stdout[0]).toBe(PIS_PASEP_GOLDEN_PRIMARY);
  });

  it('strips with json', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    runPisPasepCommand('strip', PIS_PASEP_GOLDEN_PRIMARY, { json: true, quiet: false, source: false }, io);
    expect(JSON.parse(io.stdout[0]).stripped).toBe(PIS_PASEP_GOLDEN_PRIMARY);
  });
});

describe('runPisPasep', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runPisPasep('validate', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
    expect(io.stderr[0]).toContain('Missing PIS/PASEP');
  });

  it('reads from file content option', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPisPasep('validate', undefined, { json: false, quiet: true, source: false, file: PIS_PASEP_GOLDEN_PRIMARY }, io),
    ).toBe(EXIT.OK);
  });
});

describe('runPisPasepCommand default branch', () => {
  it('handles unknown action via cast', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runPisPasepCommand('unknown' as 'validate', 'x', { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.USAGE);
  });
});
