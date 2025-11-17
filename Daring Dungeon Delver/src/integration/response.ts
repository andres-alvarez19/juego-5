export async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("Content-Type");

  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    return text as unknown as T;
  }
}

export async function safeReadBody(response: Response): Promise<unknown> {
  const clone = response.clone();
  const contentType = clone.headers.get("Content-Type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      return await clone.json();
    }

    const text = await clone.text();
    return text;
  } catch {
    return null;
  }
}
