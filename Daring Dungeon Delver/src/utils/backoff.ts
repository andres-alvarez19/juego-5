export function exponentialBackoff(
  attempt: number,
  baseMs = 500,
  jitter = true
): number {
  const cappedAttempt = Math.max(0, attempt);
  const expDelay = baseMs * Math.pow(2, cappedAttempt);

  if (!jitter) {
    return expDelay;
  }

  const randomFactor = 0.5 + Math.random() * 0.5;
  return expDelay * randomFactor;
}

