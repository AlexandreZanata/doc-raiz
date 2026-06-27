'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { Label } from '@/components/atoms/Label';
import { Select } from '@/components/atoms/Select';
import { ResultRow } from '@/components/molecules/ResultRow';
import { ResultSection } from '@/components/molecules/ResultSection';
import { useI18n } from '@/components/providers/I18nProvider';
import {
  formatDatasetRowPreview,
  isDatasetSearchQueryEligible,
  searchDatasets,
  type DatasetSearchResult,
} from '@/lib/reference-data/dataset-search';
import { getAllDatasetAdapters } from '@/lib/reference-data/dataset-registry';
import styles from './organisms.module.css';

const SEARCH_DEBOUNCE_MS = 300;

function formatResultCount(template: string, count: number): string {
  return template.replace('{count}', String(count));
}

export function DataExplorerHub() {
  const { messages } = useI18n();
  const copy = messages.referenceData.explorer;
  const adapters = useMemo(
    () => [...getAllDatasetAdapters()].sort((left, right) => left.nome.localeCompare(right.nome)),
    [],
  );

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [datasetFilter, setDatasetFilter] = useState('all');
  const [results, setResults] = useState<DatasetSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      clearTimeout(handle);
    };
  }, [query]);

  useEffect(() => {
    if (!isDatasetSearchQueryEligible(debouncedQuery)) {
      setResults([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void searchDatasets(debouncedQuery, {
      datasetId: datasetFilter === 'all' ? undefined : datasetFilter,
    }).then((hits) => {
      if (cancelled) {
        return;
      }
      setResults(hits);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery, datasetFilter]);

  const totalRows = results.reduce((sum, group) => sum + group.rows.length, 0);
  const queryTooShort =
    debouncedQuery.trim().length > 0 && !isDatasetSearchQueryEligible(debouncedQuery);

  return (
    <main className={styles.panel}>
      <header>
        <h1 className={styles.title}>{copy.title}</h1>
        <p className={styles.description}>{copy.description}</p>
      </header>

      <div>
        <Label htmlFor="data-explorer-search">{copy.searchLabel}</Label>
        <div className={styles.explorerSearchRow}>
          <Input
            id="data-explorer-search"
            className={styles.explorerSearchInput}
            value={query}
            placeholder={copy.searchPlaceholder}
            aria-busy={loading}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
          />
          {query.length > 0 ? (
            <Button
              type="button"
              onClick={() => {
                setQuery('');
              }}
            >
              {copy.clearButton}
            </Button>
          ) : null}
        </div>
      </div>

      <div>
        <Label htmlFor="data-explorer-dataset">{copy.datasetFilterLabel}</Label>
        <Select
          id="data-explorer-dataset"
          value={datasetFilter}
          onChange={(event) => {
            setDatasetFilter(event.target.value);
          }}
        >
          <option value="all">{copy.allDatasets}</option>
          {adapters.map((adapter) => (
            <option key={adapter.id} value={adapter.id}>
              {adapter.nome}
            </option>
          ))}
        </Select>
      </div>

      {queryTooShort ? <p className={styles.description}>{copy.queryTooShort}</p> : null}

      {loading ? (
        <div className={styles.explorerSkeleton} aria-hidden="true">
          <div className={styles.explorerSkeletonBar} />
          <div className={styles.explorerSkeletonBar} />
          <div className={styles.explorerSkeletonBar} />
        </div>
      ) : null}

      {!loading && isDatasetSearchQueryEligible(debouncedQuery) ? (
        <p className={styles.description}>
          {formatResultCount(copy.resultCount, totalRows)}
        </p>
      ) : null}

      {!loading &&
      isDatasetSearchQueryEligible(debouncedQuery) &&
      results.length === 0 &&
      !queryTooShort ? (
        <p className={styles.description}>{copy.emptyState}</p>
      ) : null}

      {results.map((group) => {
        const adapter = adapters.find((entry) => entry.id === group.datasetId);
        const fieldKeys = adapter?.fieldKeys ?? [];

        const title = (
          <span className={styles.explorerSectionTitle}>
            <span>{group.nome}</span>
            <Badge variant="neutral">{group.rows.length}</Badge>
            {group.playgroundRoute !== undefined ? (
              <Link className={styles.officialSourcesPageLink} href={group.playgroundRoute}>
                {copy.openExplorer}
              </Link>
            ) : null}
          </span>
        );

        return (
          <ResultSection key={group.datasetId} title={title}>
            {group.error !== undefined ? (
              <p className={styles.description}>{copy.datasetError.replace('{message}', group.error)}</p>
            ) : null}
            {group.rows.map((row, index) => {
              const preview = formatDatasetRowPreview(row, fieldKeys);
              const rowKey = `${group.datasetId}-${preview.primary}-${String(index)}`;
              return (
                <div key={rowKey} className={styles.explorerResultBlock}>
                  <ResultRow label={copy.codeField} value={preview.primary} />
                  {preview.secondary.length > 0 ? (
                    <ResultRow label={copy.descriptionField} value={preview.secondary} mono={false} />
                  ) : null}
                </div>
              );
            })}
          </ResultSection>
        );
      })}
    </main>
  );
}
