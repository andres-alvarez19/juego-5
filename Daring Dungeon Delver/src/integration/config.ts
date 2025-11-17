const DEFAULT_LOCAL_BASE = "http://localhost:8080/v1";

export function resolveApiBase(): string {
  const envBase = (import.meta.env as any).VITE_API_BASE as string | undefined;
  if (typeof envBase === "string" && envBase.trim()) {
    return envBase.trim().replace(/\/+$/, "");
  }

  const envBaseUrl = (import.meta.env as any).VITE_API_BASE_URL as
    | string
    | undefined;
  if (typeof envBaseUrl === "string" && envBaseUrl.trim()) {
    return `${envBaseUrl.trim().replace(/\/+$/, "")}/v1`;
  }

  return DEFAULT_LOCAL_BASE;
}

/**
 * Devuelve el gameId como string para usar en rutas
 * (/collection/my-games/{gameId}, /leaderboards/{gameId}, etc.).
 * Prioriza el parámetro de la URL (?gameId=...) y luego VITE_GAME_ID.
 */
export function resolveGameIdForPath(): string | null {
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawGameId = params.get("gameId");
      if (rawGameId && rawGameId.trim()) {
        return rawGameId.trim();
      }
    } catch {
      // Ignorar errores de parsing de URL
    }
  }

  const envGameId = (import.meta.env as any).VITE_GAME_ID as
    | string
    | undefined;
  if (typeof envGameId === "string" && envGameId.trim()) {
    return envGameId.trim();
  }

  return null;
}

export function resolveNumericGameId(): number | null {
  if (typeof window !== "undefined") {
    try {
      const params = new URLSearchParams(window.location.search);
      const rawGameId = params.get("gameId");
      if (rawGameId && rawGameId.trim()) {
        const parsed = Number(rawGameId);
        if (Number.isFinite(parsed) && parsed > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignore URL parsing errors and fall back to env-based config
    }
  }

  const envGameId = (import.meta.env as any).VITE_GAME_ID as
    | string
    | undefined;
  if (typeof envGameId === "string" && envGameId.trim()) {
    const parsed = Number(envGameId);
    if (Number.isFinite(parsed) && parsed > 0) {
      return parsed;
    }
  }

  return null;
}
