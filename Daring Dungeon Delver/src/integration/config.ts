export function resolveApiBase(): string {
  console.log('[resolveApiBase]', import.meta.env.VITE_API_BASE_URL);
  const envBaseUrl = (import.meta.env as any).VITE_API_BASE_URL as
    | string
    | undefined;
  if (typeof envBaseUrl === "string" && envBaseUrl.trim()) {
    return envBaseUrl.trim().replace(/\/+$/, "");
  }
  throw new Error("VITE_API_BASE_URL must be defined");
}

/**
 * Devuelve el gameId como string para usar en rutas
 * (/collection/my-games/{gameId}, /leaderboards/{gameId}, etc.).
 * Se obtiene únicamente desde el parámetro de la URL (?gameId=...).
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
      // Ignorar errores de parsing de URL
    }
  }

  return null;
}
