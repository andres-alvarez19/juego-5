import type { ApiErrorDetails } from '@/models/types';

interface SafeFetchOptions extends RequestInit {
  maxRetries?: number;
  retryDelay?: number;
}

export class FetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'FetchError';
  }
}

/**
 * Safe fetch wrapper with retry logic and error handling
 */
export async function safeFetch<T>(
  url: string,
  options: SafeFetchOptions = {}
): Promise<T> {
  const { maxRetries = 2, retryDelay = 1000, ...fetchOptions } = options;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, fetchOptions);

      // Handle 401 Unauthorized
      if (response.status === 401) {
        throw new FetchError('Unauthorized - Please log in again', 401, 'UNAUTHORIZED');
      }

      // Handle other error statuses
      if (!response.ok) {
        const errorData = await parseErrorResponse(response);
        throw new FetchError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData.code
        );
      }

      // Parse successful response
      const data = await parseSuccessResponse<T>(response);
      return data;
    } catch (error) {
      lastError = error as Error;

      // Don't retry on 401 or client errors (4xx)
      if (error instanceof FetchError && (error.status === 401 || error.status < 500)) {
        throw error;
      }

      // Wait before retrying
      if (attempt < maxRetries) {
        await wait(retryDelay * (attempt + 1));
      }
    }
  }

  throw lastError || new Error('Unknown error occurred');
}

async function parseErrorResponse(response: Response): Promise<ApiErrorDetails> {
  try {
    const data = await response.json();
    return {
      message: data.message || data.error || 'Unknown error',
      status: response.status,
      code: data.code,
    };
  } catch {
    return {
      message: response.statusText || 'Unknown error',
      status: response.status,
    };
  }
}

async function parseSuccessResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return await response.json();
  }
  
  // If no content, return empty object
  if (response.status === 204) {
    return {} as T;
  }
  
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return text as T;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
