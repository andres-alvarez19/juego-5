type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = new Set(["token", "authToken", "authorization"]);

const isDevelopment = (() => {
  const nodeEnv =
    typeof process !== "undefined" ? process.env?.NODE_ENV : undefined;

  if (typeof nodeEnv === "string") {
    return nodeEnv !== "production";
  }

  try {
    return Boolean((import.meta as ImportMeta).env?.DEV);
  } catch {
    return true;
  }
})();

function sanitize(value: unknown): unknown {
  if (!value || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(sanitize);
  }

  const entries = Object.entries(value as Record<string, unknown>).map(
    ([key, val]) => {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        return [key, "[REDACTED]"];
      }
      return [key, sanitize(val)];
    }
  );

  return Object.fromEntries(entries);
}

function write(level: LogLevel, message: string, meta?: unknown): void {
  const entry = meta ? sanitize(meta) : undefined;

  switch (level) {
    case "debug":
      if (isDevelopment) {
        console.debug(message, entry);
      }
      break;
    case "info":
      console.info(message, entry);
      break;
    case "warn":
      console.warn(message, entry);
      break;
    case "error":
      console.error(message, entry);
      break;
    default:
      console.log(message, entry);
      break;
  }
}

export const logger = {
  debug(message: string, meta?: unknown): void {
    write("debug", message, meta);
  },
  info(message: string, meta?: unknown): void {
    write("info", message, meta);
  },
  warn(message: string, meta?: unknown): void {
    write("warn", message, meta);
  },
  error(message: string, meta?: unknown): void {
    write("error", message, meta);
  },
};

