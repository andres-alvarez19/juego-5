// Rutas relativas sin slash inicial para respetar el path base de la API (p.ej. /v0, /v1)
export const sessionUpdatePath = (gameId: number | string) =>
  `collection/my-games/${gameId}/session-update`;

export const leaderboardsPath = (gameId: number | string, limit = 10) =>
  `collection/leaderboards/${gameId}?limit=${encodeURIComponent(limit)}`;
