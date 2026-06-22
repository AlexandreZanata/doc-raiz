import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

describe('dist bundle', () => {
  it('has exactly one shebang line for ESM bin compatibility', () => {
    const dir = dirname(fileURLToPath(import.meta.url));
    const dist = readFileSync(join(dir, '../dist/index.js'), 'utf8');
    const shebangs = dist.split('\n').filter((line) => line.startsWith('#!'));
    expect(shebangs).toEqual(['#!/usr/bin/env node']);
  });
});
