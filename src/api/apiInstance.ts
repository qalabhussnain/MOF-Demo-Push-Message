// Basic ADS Pass configuration placeholders (aligns with client document).
// In real environments, keep secrets like API keys out of source control.
const ADS_PASS_BASE_URL = 'http://localhost:5267'; // matches Postman {{baseUrl}}
const ADS_PASS_API_KEY_HEADER = 'X-Api-Key';
const ADS_PASS_API_KEY: string | undefined = undefined; // fill only if your deployment enforces API key

type QueryValue = string | number | boolean | null | undefined;
type Query = Record<string, QueryValue>;

export type ApiRequestConfig = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  url: string; // full URL or relative path (if `baseURL` is set)
  params?: Query; // query string params
  headers?: Record<string, string>;
  body?: unknown; // JSON body (optional)
  timeoutMs?: number;
};

export type ApiResponse<T> = {
  status: number;
  data: T;
  headers?: Record<string, string>;
};

type RequestInterceptor = (
  config: ApiRequestConfig,
) => ApiRequestConfig | Promise<ApiRequestConfig>;
type ResponseInterceptor<T = unknown> = (
  response: ApiResponse<T>,
) => ApiResponse<T> | Promise<ApiResponse<T>>;
type ErrorInterceptor = (error: unknown) => unknown;

export class ApiError extends Error {
  status?: number;
  data?: unknown;
  url?: string;
  method?: string;

  constructor(
    message: string,
    opts?: { status?: number; data?: unknown; url?: string; method?: string },
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = opts?.status;
    this.data = opts?.data;
    this.url = opts?.url;
    this.method = opts?.method;
  }
}

function buildQueryString(params?: Query) {
  if (!params) {
    return '';
  }
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) {
      continue;
    }
    sp.append(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : '';
}

function joinUrl(baseURL: string | undefined, url: string) {
  if (!baseURL) {
    return url;
  }
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const base = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${base}${path}`;
}

function safeJsonParse(text: string): unknown {
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function maskMaybeSensitive(obj: unknown): unknown {
  // Keep it simple: only mask obvious token/key fields when object-like.
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  const out: Record<string, unknown> = Array.isArray(obj) ? {} : {};
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = k.toLowerCase();
    if (
      [
        'x-api-key',
        'apikey',
        'api-key',
        'token',
        'devicetoken',
        'fcmtoken',
        'authorization',
      ].includes(key)
    ) {
      out[k] = v;
    }
  }
  return out;
}

export function createApiInstance(opts: {
  baseURL?: string; // e.g. "http://localhost:5267"
  defaultHeaders?: Record<string, string>;
  timeoutMs?: number;
}) {
  const requestInterceptors: RequestInterceptor[] = [];
  const responseInterceptors: ResponseInterceptor[] = [];
  const errorInterceptors: ErrorInterceptor[] = [];

  // Default interceptors (logs request/response/error)
  requestInterceptors.push(async cfg => {
    console.log('[API][REQ]', {
      method: cfg.method,
      url: cfg.url,
      params: maskMaybeSensitive(cfg.params),
      headers: maskMaybeSensitive(cfg.headers),
      body: maskMaybeSensitive(cfg.body),
    });
    return cfg;
  });

  responseInterceptors.push(async res => {
    console.log('[API][RES]', {
      status: res.status,
      data: maskMaybeSensitive(res.data),
    });
    return res;
  });

  errorInterceptors.push(err => {
    console.error('[API][ERR]', err);
    return err;
  });

  async function runRequestInterceptors(config: ApiRequestConfig) {
    let cfg = config;
    for (const fn of requestInterceptors) {
      cfg = await fn(cfg);
    }
    return cfg;
  }

  async function runResponseInterceptors<T>(response: ApiResponse<T>) {
    let res: ApiResponse<unknown> = response as ApiResponse<unknown>;
    for (const fn of responseInterceptors) {
      res = await fn(res);
    }
    return res as ApiResponse<T>;
  }

  function runErrorInterceptors(error: unknown) {
    let err = error;
    for (const fn of errorInterceptors) {
      err = fn(err);
    }
    return err;
  }

  async function request<T>(config: ApiRequestConfig): Promise<T> {
    const merged: ApiRequestConfig = {
      ...config,
      timeoutMs: config.timeoutMs ?? opts.timeoutMs ?? 15000,
      headers: {
        Accept: 'application/json',
        ...(opts.defaultHeaders ?? {}),
        ...(config.headers ?? {}),
      },
    };

    const cfg = await runRequestInterceptors(merged);
    const fullUrl =
      joinUrl(opts.baseURL, cfg.url) + buildQueryString(cfg.params);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), cfg.timeoutMs);

    try {
      const res = await fetch(fullUrl, {
        method: cfg.method,
        headers: cfg.headers,
        body: cfg.body !== undefined ? JSON.stringify(cfg.body) : undefined,
        signal: controller.signal,
      });

      const text = await res.text();
      const data = safeJsonParse(text) as T;

      const apiRes = await runResponseInterceptors<T>({
        status: res.status,
        data,
      });

      if (!res.ok) {
        throw new ApiError(`HTTP ${res.status}`, {
          status: res.status,
          data: apiRes.data,
          url: fullUrl,
          method: cfg.method,
        });
      }

      return apiRes.data;
    } catch (e) {
      runErrorInterceptors(e);
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }

  return {
    interceptors: {
      request: {
        use(fn: RequestInterceptor) {
          requestInterceptors.push(fn);
        },
      },
      response: {
        use(fn: ResponseInterceptor) {
          responseInterceptors.push(fn);
        },
      },
      error: {
        use(fn: ErrorInterceptor) {
          errorInterceptors.push(fn);
        },
      },
    },
    request,
    post<T>(url: string, config?: Omit<ApiRequestConfig, 'method' | 'url'>) {
      return request<T>({
        method: 'POST',
        url,
        ...(config ?? {}),
      });
    },
  };
}

/**
 * Default shared instance for the app (edit placeholders here).
 */
export const api = createApiInstance({
  baseURL: ADS_PASS_BASE_URL,
  timeoutMs: 15000,
  defaultHeaders: ADS_PASS_API_KEY
    ? { [ADS_PASS_API_KEY_HEADER]: ADS_PASS_API_KEY }
    : undefined,
});
