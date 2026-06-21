import {
  CEP_OFFICIAL_SOURCE_URL,
  formatCep,
  stripCep,
  validateCep,
} from 'br-validators';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type CepAction = 'validate' | 'format' | 'strip';

export type CepOptions = {
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

export function runCepCommand(
  action: CepAction,
  input: string,
  options: CepOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? CEP_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validateCep(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatCep(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripCep(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runCep(
  action: CepAction,
  value: string | undefined,
  options: CepOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing CEP value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runCepCommand(action, input, options, io);
}
