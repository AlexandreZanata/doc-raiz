import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { exitWithError } from './lib/errors.js';
import { syncDailyGoldenVectors } from './lib/sync-daily-golden-vectors.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function main(): Promise<void> {
  const { selicUpdated, ptaxUpdated } = await syncDailyGoldenVectors({ rootDir: ROOT });

  if (selicUpdated) {
    console.log('Updated packages/br-validators/tests/vectors/selic.official.json');
  }
  if (ptaxUpdated) {
    console.log('Updated packages/br-validators/tests/vectors/ptax.official.json');
  }
  if (!selicUpdated && !ptaxUpdated) {
    console.log('Daily golden vectors already in sync (selic, ptax).');
  }
}

main().catch(exitWithError);
