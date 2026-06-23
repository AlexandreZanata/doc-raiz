const DEFAULT_TIMEOUT_MS = 30_000;
const USER_AGENT = 'br-validators-data-refresh/1.0 (+https://github.com/AlexandreZanata/br-validators)';

export class FetchError extends Error {
  constructor(
    message: string,
    readonly url: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

export async function fetchText(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'text/csv,text/plain,*/*',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new FetchError(`HTTP ${String(response.status)} fetching ${url}`, url, response.status);
    }

    return await response.text();
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, url);
    }
    throw new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', url);
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchJson<T>(url: string, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': USER_AGENT,
      },
    });

    if (!response.ok) {
      throw new FetchError(`HTTP ${String(response.status)} fetching ${url}`, url, response.status);
    }

    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof FetchError) {
      throw error;
    }
    if (error instanceof Error && error.name === 'AbortError') {
      throw new FetchError(`Timeout after ${String(timeoutMs)}ms`, url);
    }
    throw new FetchError(error instanceof Error ? error.message : 'Unknown fetch error', url);
  } finally {
    clearTimeout(timer);
  }
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}
