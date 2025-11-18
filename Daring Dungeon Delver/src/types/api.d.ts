export interface LeaderboardRow {
  rank: number;
  username: string;
  score: number;
}

export interface SessionUpdatePayload {
  gameSessionDurationSeconds: number;
  scoreAchieved?: number;
  eventId: string;
  authToken?: string;
}

export interface ApiResponse<T = unknown> {
  status: boolean;
  data?: T;
  error?: string;
}
