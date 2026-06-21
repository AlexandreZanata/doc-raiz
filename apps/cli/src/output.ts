import type { FormatResult, ValidationResult } from 'br-validators';
import { EXIT } from './constants.js';

export type CliOutput = {
  stdout: string[];
  stderr: string[];
  exitCode: number;
};

export function printValidation(
  result: ValidationResult,
  options: { json: boolean; quiet: boolean; source?: string },
  io: Pick<CliOutput, 'stdout' | 'stderr'> = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(
      JSON.stringify(
        result.ok
          ? {
              ok: true,
              value: result.value,
              format: result.format,
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
    io.stdout.push(`valid: yes (${result.format})`);
    io.stdout.push(`value: ${result.value}`);
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

export function printFormat(
  result: FormatResult,
  options: { json: boolean; quiet: boolean },
  io: Pick<CliOutput, 'stdout' | 'stderr'> = { stdout: [], stderr: [] },
): number {
  if (options.json) {
    io.stdout.push(JSON.stringify(result, null, 2));
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (options.quiet) {
    return result.ok ? EXIT.OK : EXIT.INVALID;
  }

  if (result.ok) {
    io.stdout.push(result.formatted);
    return EXIT.OK;
  }

  io.stderr.push(`code: ${result.code}`);
  io.stderr.push(`message: ${result.message}`);
  return EXIT.INVALID;
}

export function printStrip(value: string, options: { json: boolean }, io: { stdout: string[] } = { stdout: [] }): number {
  if (options.json) {
    io.stdout.push(JSON.stringify({ stripped: value }, null, 2));
  } else {
    io.stdout.push(value);
  }
  return EXIT.OK;
}
