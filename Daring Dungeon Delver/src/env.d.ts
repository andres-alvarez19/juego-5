interface ImportMetaEnv {
  readonly VITE_API_BASE: string;
  readonly VITE_ALLOWED_ORIGIN: string;
  readonly VITE_HEARTBEAT_SEC?: string;
  readonly VITE_MAX_BATCH_SEC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

