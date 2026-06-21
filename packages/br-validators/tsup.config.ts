import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/cnpj.ts', 'src/cpf.ts', 'src/cep.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
});
