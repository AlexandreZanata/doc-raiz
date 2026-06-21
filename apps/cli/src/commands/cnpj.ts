import {
  CNPJ_OFFICIAL_SOURCE_URL,
  formatCnpj,
  stripCnpj,
  validateCnpj,
} from 'br-validators';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type CnpjAction = 'validate' | 'format' | 'strip';

export type CnpjOptions = {
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

export function runCnpjCommand(
  action: CnpjAction,
  input: string,
  options: CnpjOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? CNPJ_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateCnpj(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatCnpj(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripCnpj(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runCnpj(
  action: CnpjAction,
  value: string | undefined,
  options: CnpjOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing CNPJ value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runCnpjCommand(action, input, options, io);
}
