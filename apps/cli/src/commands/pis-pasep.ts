import {
  PIS_PASEP_OFFICIAL_SOURCE_URL,
  formatPisPasep,
  stripPisPasep,
  validatePisPasep,
} from '@br-validators/core';
import { EXIT } from '../constants.js';
import { printFormat, printStrip, printValidation } from '../output.js';

export type PisPasepAction = 'validate' | 'format' | 'strip';

export type PisPasepOptions = {
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

export function runPisPasepCommand(
  action: PisPasepAction,
  input: string,
  options: PisPasepOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const source = options.source ? PIS_PASEP_OFFICIAL_SOURCE_URL : undefined;

  switch (action) {
    case 'validate':
      return printValidation(validatePisPasep(input), { json: options.json, quiet: options.quiet, source }, io);
    case 'format':
      return printFormat(formatPisPasep(input), { json: options.json, quiet: options.quiet }, io);
    case 'strip':
      return printStrip(stripPisPasep(input), { json: options.json }, io);
    default: {
      const _exhaustive: never = action;
      io.stderr.push(`Unknown action: ${_exhaustive}`);
      return EXIT.USAGE;
    }
  }
}

export function runPisPasep(
  action: PisPasepAction,
  value: string | undefined,
  options: PisPasepOptions,
  io: { stdout: string[]; stderr: string[] } = { stdout: [], stderr: [] },
): number {
  const input = resolveInput(value, options.file);
  if (input === null) {
    io.stderr.push('Missing PIS/PASEP value. Pass an argument or use --file.');
    return EXIT.USAGE;
  }
  return runPisPasepCommand(action, input, options, io);
}
