interface ImportMetaEnv {
  readonly VITE_API_BASE?: string;
  readonly VITE_ALLOWED_ORIGIN?: string;
  readonly VITE_HEARTBEAT_SEC?: string;
  readonly VITE_MAX_BATCH_SEC?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GAME_ID?: string;
  readonly VITE_GAME_NAME?: string;
  readonly VITE_ENV?: string;
  readonly VITE_DEV_MODE?: string | boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
