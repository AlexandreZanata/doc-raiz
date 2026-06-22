import { describe, expect, it } from 'vitest';
import { EXIT } from '../src/constants.js';
import { resolveInput, printBrCodeResult, runBrCode, runBrCodeCommand } from '../src/commands/brcode.js';
import {
  BRCODE_GOLDEN_STATIC_EVP,
  BRCODE_GOLDEN_DYNAMIC_URL,
  BRCODE_OFFICIAL_SOURCE_URL,
  type BrCodePayload,
} from '@br-validators/core';

describe('resolveInput (brcode)', () => {
  it('returns null when missing value and file', () => {
    expect(resolveInput(undefined, undefined)).toBeNull();
  });
});

describe('printBrCodeResult', () => {
  it('json omits optional fields when absent', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      printBrCodeResult(
        {
          ok: true,
          value: 'payload' as BrCodePayload,
          format: 'brcode',
          merchantName: 'Merchant',
          merchantCity: 'City',
        },
        { json: true, quiet: false },
        io,
      ),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as Record<string, unknown>;
    expect(parsed.amount).toBeUndefined();
    expect(parsed.txid).toBeUndefined();
    expect(parsed.pixKey).toBeUndefined();
    expect(parsed.source).toBeUndefined();
  });
});

describe('runBrCodeCommand', () => {
  it('parses golden static EVP payload as json with txid', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('parse', BRCODE_GOLDEN_STATIC_EVP, { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as { ok: boolean; txid?: string; pixKey?: string };
    expect(parsed.ok).toBe(true);
    expect(parsed.txid).toBe('***');
    expect(parsed.pixKey).toBeDefined();
  });

  it('parses golden static EVP payload', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('parse', BRCODE_GOLDEN_STATIC_EVP, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout[0]).toBe('valid: yes');
    expect(io.stdout.some((line) => line.startsWith('pixKey:'))).toBe(true);
  });

  it('prints source in plain parse output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('parse', BRCODE_GOLDEN_STATIC_EVP, { json: false, quiet: false, source: true }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('source:'))).toBe(true);
  });

  it('parses dynamic URL payload with initiation URL field', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('parse', BRCODE_GOLDEN_DYNAMIC_URL, { json: false, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout.some((line) => line.startsWith('pixInitiationUrl:'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('amount:'))).toBe(true);
    expect(io.stdout.some((line) => line.startsWith('txid:'))).toBe(true);
  });

  it('parses dynamic URL payload as json with optional fields', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('parse', BRCODE_GOLDEN_DYNAMIC_URL, { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as {
      ok: boolean;
      amount?: string;
      txid?: string;
      pixInitiationUrl?: string;
      pixKey?: string;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.amount).toBe('123.45');
    expect(parsed.txid).toBe('RP12345678-2019');
    expect(parsed.pixInitiationUrl).toContain('pix.example.com');
    expect(parsed.pixKey).toBeUndefined();
  });

  it('validates static payload', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('validate', BRCODE_GOLDEN_STATIC_EVP, { json: true, quiet: false, source: true }, io),
    ).toBe(EXIT.OK);
    const parsed = JSON.parse(io.stdout[0]) as {
      ok: boolean;
      source?: string;
      pixKey?: string;
      pixKeyType?: string;
    };
    expect(parsed.ok).toBe(true);
    expect(parsed.source).toBe(BRCODE_OFFICIAL_SOURCE_URL);
    expect(parsed.pixKey).toBeDefined();
    expect(parsed.pixKeyType).toBe('evp');
  });

  it('validate rejects dynamic URL-only payload', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('validate', BRCODE_GOLDEN_DYNAMIC_URL, { json: true, quiet: false, source: false }, io),
    ).toBe(EXIT.INVALID);
  });

  it('returns invalid json for tampered payload', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    const tampered = `${BRCODE_GOLDEN_STATIC_EVP.slice(0, -1)}E`;
    expect(runBrCodeCommand('parse', tampered, { json: true, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(JSON.parse(io.stdout[0]).ok).toBe(false);
  });

  it('prints stderr on invalid plain output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBrCodeCommand('parse', 'bad', { json: false, quiet: false, source: false }, io)).toBe(EXIT.INVALID);
    expect(io.stderr[0]).toBe('valid: no');
  });

  it('quiet mode returns exit code only', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('validate', BRCODE_GOLDEN_STATIC_EVP, { json: false, quiet: true, source: false }, io),
    ).toBe(EXIT.OK);
    expect(io.stdout).toHaveLength(0);
  });

  it('quiet mode returns invalid exit code without output', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCodeCommand('validate', BRCODE_GOLDEN_DYNAMIC_URL, { json: false, quiet: true, source: false }, io),
    ).toBe(EXIT.INVALID);
    expect(io.stdout).toHaveLength(0);
    expect(io.stderr).toHaveLength(0);
  });
});

describe('runBrCode', () => {
  it('returns usage when input missing', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(runBrCode('parse', undefined, { json: false, quiet: false, source: false }, io)).toBe(EXIT.USAGE);
  });

  it('reads from file content', () => {
    const io = { stdout: [] as string[], stderr: [] as string[] };
    expect(
      runBrCode('parse', undefined, { json: false, quiet: false, source: false, file: BRCODE_GOLDEN_STATIC_EVP }, io),
    ).toBe(EXIT.OK);
  });
});
