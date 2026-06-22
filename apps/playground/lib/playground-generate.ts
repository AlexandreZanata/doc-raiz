import {
  BRCODE_GOLDEN_STATIC_EVP,
  formatPixKey,
} from '@br-validators/core';
import {
  generate,
  type GenerateOptions,
  type GeneratableDocumentType,
} from '@br-validators/core';
import { generatePixEvp } from './generators/pix';
import { generateIeDocument } from './generators/ie';
import { generateBoletoDocument } from './generators/boleto';
import { generateTituloEleitorDocument } from './generators/titulo-eleitor';
import { generateNfeChaveDocument } from './generators/nfe-chave';
import { generateTelefoneDocument } from './generators/telefone';
import { applyPlaygroundDisplayMask } from './format-display';
import { DOCUMENT_META } from './document-meta';
import type { GeneratableCardBrand, UfCode } from '@br-validators/core';
import { generateCreditCard } from './generators/cartao';
import type { DocumentSlug } from './nav';

function resolveCoreFormat(
  slug: DocumentSlug,
  format: string | undefined,
): GenerateOptions['format'] | undefined {
  if (slug === 'placa') {
    return format === 'legacy' ? 'legacy' : 'mercosul';
  }
  if (slug === 'cnpj') {
    return format === 'alphanumeric' ? 'alphanumeric' : 'numeric';
  }
  if (slug === 'telefone') {
    return format === 'fixo' ? 'fixo' : 'celular';
  }
  return format as GenerateOptions['format'] | undefined;
}

const GENERATE_TYPE: Partial<Record<DocumentSlug, GeneratableDocumentType>> = {
  cpf: 'cpf',
  cnpj: 'cnpj',
  cep: 'cep',
  placa: 'placa',
  pis: 'pis-pasep',
  cnh: 'cnh',
  renavam: 'renavam',
};

export type PlaygroundGenerateOptions = {
  seed?: number;
  masked?: boolean;
  format?: string;
  uf?: UfCode;
};

export function randomSeed(): number {
  return Math.floor(Math.random() * 2_147_483_647);
}

/** Stable per-slug seed for SSR-safe initial workspace values (avoid hydration mismatch). */
export function workspaceSeedForSlug(slug: DocumentSlug): number {
  let hash = 2_166_136_261;
  for (let i = 0; i < slug.length; i++) {
    hash ^= slug.charCodeAt(i);
    hash = Math.imul(hash, 16_777_619);
  }
  return (hash >>> 0) || 1;
}

export function goldenSample(slug: DocumentSlug): string | null {
  const samples: Partial<Record<DocumentSlug, string>> = {
    brcode: BRCODE_GOLDEN_STATIC_EVP,
  };
  return samples[slug] ?? null;
}

export function supportsValidGeneration(slug: DocumentSlug): boolean {
  return (
    slug in GENERATE_TYPE ||
    slug === 'pix' ||
    slug === 'ie' ||
    slug === 'boleto' ||
    slug === 'titulo-eleitor' ||
    slug === 'nfe-chave' ||
    slug === 'telefone' ||
    slug === 'cartao' ||
    goldenSample(slug) !== null
  );
}

function goldenSampleRaw(_slug: DocumentSlug, formatted: string): string {
  return formatted;
}

export function generateValidDocument(
  slug: DocumentSlug,
  options: PlaygroundGenerateOptions & { masked: boolean },
): string {
  const seed = options.seed ?? randomSeed();
  const golden = goldenSample(slug);

  if (golden && !(slug in GENERATE_TYPE) && slug !== 'pix' && slug !== 'ie' && slug !== 'boleto' && slug !== 'titulo-eleitor' && slug !== 'nfe-chave' && slug !== 'cartao') {
    return options.masked ? golden : goldenSampleRaw(slug, golden);
  }

  if (slug === 'pix') {
    const raw = generatePixEvp();
    if (!options.masked) {
      return raw;
    }
    const formatted = formatPixKey(raw);
    return formatted.ok ? formatted.formatted : raw;
  }

  if (slug === 'ie') {
    if (!options.uf) {
      throw new Error('UF is required for IE generation');
    }
    return generateIeDocument(options.uf, options.masked, seed);
  }

  if (slug === 'boleto') {
    return generateBoletoDocument(options.masked, seed);
  }

  if (slug === 'titulo-eleitor') {
    if (!options.uf) {
      throw new Error('UF is required for titulo-eleitor generation');
    }
    return generateTituloEleitorDocument(options.uf, options.masked, seed);
  }

  if (slug === 'nfe-chave') {
    return generateNfeChaveDocument(options.masked, seed);
  }

  if (slug === 'telefone') {
    if (!options.uf) {
      throw new Error('UF is required for telefone generation');
    }
    const phoneFormat = options.format === 'fixo' ? 'fixo' : 'celular';
    return generateTelefoneDocument(options.uf, phoneFormat, options.masked, seed);
  }

  if (slug === 'cartao') {
    const brand = (options.format ?? 'visa') as GeneratableCardBrand;
    return generateCreditCard(brand, options.masked, seed);
  }

  const type = GENERATE_TYPE[slug];
  if (!type) {
    throw new Error(`Generate not supported for ${slug}`);
  }

  const coreOptions: GenerateOptions = {
    seed,
    masked: options.masked,
  };

  const resolvedFormat = resolveCoreFormat(slug, options.format);
  if (resolvedFormat) {
    coreOptions.format = resolvedFormat;
  }

  const generated = generate(type, coreOptions);
  return applyPlaygroundDisplayMask(slug, generated, options.masked);
}

/** @deprecated Use generateValidDocument */
export function playgroundGenerate(slug: DocumentSlug, options: PlaygroundGenerateOptions = {}): string {
  return generateValidDocument(slug, {
    ...options,
    masked: options.masked ?? false,
  });
}

export function initialWorkspaceInput(
  slug: DocumentSlug,
  uf: UfCode,
  format?: string,
): string {
  if (!supportsValidGeneration(slug)) {
    return DOCUMENT_META[slug].defaultInput;
  }

  return generateValidDocument(slug, {
    masked: true,
    seed: workspaceSeedForSlug(slug),
    format,
    uf,
  });
}
