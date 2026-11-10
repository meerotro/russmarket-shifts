/**
 * The only place in the app that talks HTTP. Every failure, whatever its cause, leaves this
 * module as an ApiError, so callers handle one error type.
 */

export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status; 0 means the request never reached the server. */
    readonly status: number,
    /** Validation messages keyed by field path, e.g. "upsert.3.end_time". */
    readonly fieldErrors: FieldErrors = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get isValidation(): boolean {
    return this.status === 422;
  }

  get isNetwork(): boolean {
    return this.status === 0;
  }
}

/** True for the error fetch throws when its AbortSignal fires: a cancelled, not a failed, request. */
export function isAbort(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError';
}

type Query = Record<string, string | number | undefined>;

interface RequestOptions {
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
}

const BASE_URL = '/api';

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== '') params.set(key, String(value));
  }
  const suffix = params.toString();
  return `${BASE_URL}${path}${suffix ? `?${suffix}` : ''}`;
}

function messageFor(status: number, fallback: unknown): string {
  if (typeof fallback === 'string' && fallback !== '' && status < 500) return fallback;
  if (status === 404) return 'Данные не найдены';
  if (status >= 500) return 'Ошибка сервера. Попробуйте ещё раз';
  return 'Не удалось выполнить запрос';
}

async function request<T>(method: string, path: string, options: RequestOptions = {}): Promise<T> {
  let response: Response;

  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      signal: options.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body === undefined ? {} : { 'Content-Type': 'application/json' }),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch (error) {
    if (isAbort(error)) throw error;
    throw new ApiError('Нет связи с сервером. Проверьте подключение', 0);
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body = (payload ?? {}) as { message?: unknown; errors?: FieldErrors };
    throw new ApiError(messageFor(response.status, body.message), response.status, body.errors);
  }

  return payload as T;
}

export const http = {
  get: <T>(path: string, options?: Omit<RequestOptions, 'body'>) =>
    request<T>('GET', path, options),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, { body }),
  post: <T>(path: string, body: unknown) => request<T>('POST', path, { body }),
};
