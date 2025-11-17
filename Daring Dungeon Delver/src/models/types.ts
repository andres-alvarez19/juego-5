export interface User {
  id: string;
  displayName: string;
  token: string;
}

export interface ApiErrorDetails {
  message: string;
  status: number;
  code?: string;
}

export interface LeaderboardEntry {
  user_id: string;
  user_name: string;
  score: number;
  level: number;
  mode: string;
  created_at: string;
}

export interface SessionPayload {
  user_id: string;
  game_id: string;
  client_time: string;
  mode: string;
  level: number;
}

export interface SessionUpdatePayload {
  session_id: string;
  client_time: string;
  duration_seconds: number;
}

export interface SessionResponse {
  session_id: string;
  status: string;
  message?: string;
}

export interface ScorePayload {
  session_id: string;
  user_id: string;
  game_id: string;
  mode: string;
  level: number;
  score: number;
  metadata?: Record<string, unknown>;
}

export interface ScoreResponse {
  score_id: string;
  status: string;
  message?: string;
}
