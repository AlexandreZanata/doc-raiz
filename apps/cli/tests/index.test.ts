import { describe, expect, it } from 'vitest';
import { run } from '../src/program.js';

describe('index entry', () => {
  it('run executes list command', async () => {
    const { run: runProgram } = await import('../src/program.js');
    expect(() => runProgram(['node', 'br-validators', 'list'])).not.toThrow();
  });
});
