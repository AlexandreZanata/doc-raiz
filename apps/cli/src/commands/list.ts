import { SUPPORTED_TYPES } from '../constants.js';

export function listSupportedTypes(io: { stdout: string[] } = { stdout: [] }): number {
  for (const type of SUPPORTED_TYPES) {
    io.stdout.push(type);
  }
  return 0;
}
