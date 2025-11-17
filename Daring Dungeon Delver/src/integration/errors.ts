export interface ApiErrorDetails {
  status?: number;
  endpoint: string;
  attempts: number;
  cause?: unknown;
  body?: unknown;
}

export class ApiError extends Error {
  readonly details: ApiErrorDetails;

  constructor(message: string, details: ApiErrorDetails) {
    super(message);
    this.name = "ApiError";
    this.details = details;
  }
}
