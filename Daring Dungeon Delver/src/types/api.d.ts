export interface LeaderboardRow {
  rank: number;
  nickname: string;
  score: number;
}

export interface SessionUpdatePayload {
  gameSessionDurationSeconds: number;
  scoreAchieved?: number;
  eventId: string;
  authToken?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

