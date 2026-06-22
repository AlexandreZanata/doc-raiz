import {
  BRCODE_OFFICIAL_SOURCE_URL,
  parseBrCode,
  validateBrCode,
  type BrCodeValidationResult,
} from '@br-validators/core';
import { EXIT } from '../constants.js';

export type BrCodeAction = 'parse' | 'validate';

export type BrCodeOptions = {
  json: boolean;
  quiet: boolean;
  source: boolean;
  file?: string;
};

export function resolveInput(value: string | undefined, fileContent?: string): string | null {
  const input = value ?? fileContent?.trim();
  if (!input) {
    return null;
  }
  return input;
}

export function printBrCodeResult(
  result: BrCodeValidationResult,
  options: { json: boolean; quiet: boolean; source?: string },
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        result.ok
          ? {
              ok: true,
              value: result.value,
              format: result.format,
              merchantName: result.merchantName,
              merchantCity: result.merchantCity,
              ...(result.amount ? { amount: result.amount } : {}),
              ...(result.txid ? { txid: result.txid } : {}),
              ...(result.pixKey ? { pixKey: result.pixKey, pixKeyType: result.pixKeyType } : {}),
              ...(result.pixInitiationUrl ? { pixInitiationUrl: result.pixInitiationUrl } : {}),
              ...(options.source ? { source: options.source } : {}),
            }
          : { ok: false, code: result.code, message: result.message },
        null,
        2,
      ),
    );
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (result.ok) {
    io.stdout.push('valid: yes');
    io.stdout.push(`merchantName: ${result.merchantName}`);
    io.stdout.push(`merchantCity: ${result.merchantCity}`);
    if (result.amount) {
      io.stdout.push(`amount: ${result.amount}`);
    }
    if (result.txid) {
      io.stdout.push(`txid: ${result.txid}`);
    }
    if (result.pixKey) {
      io.stdout.push(`pixKey: ${result.pixKey}`);
      io.stdout.push(`pixKeyType: ${result.pixKeyType}`);
    }
    if (result.pixInitiationUrl) {
      io.stdout.push(`pixInitiationUrl: ${result.pixInitiationUrl}`);
    }
    if (options.source) {
      io.stdout.push(`source: ${options.source}`);
    }
    return EXIT.OK;
  }

  io.stderr.push('valid: no');
  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function runBrCodeCommand(
  action: BrCodeAction,
  input: string,
  options: BrCodeOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? BRCODE_OFFICIAL_SOURCE_URL : undefined;
  const result = action === 'validate' ? validateBrCode(input) : parseBrCode(input);
  return printBrCodeResult(result, { json: options.json, quiet: options.quiet, source }, io);
}

export function runBrCode(
  action: BrCodeAction,
  value: string | undefined,
  options: BrCodeOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing BR Code payload. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runBrCodeCommand(action, input, options, io);
}
