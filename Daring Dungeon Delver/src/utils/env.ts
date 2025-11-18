declare global {
  interface Window {
    __DDD_DEV_MODE__?: boolean;
  }
}

const rawDevMode = (import.meta.env as any).VITE_DEV_MODE;

let DEV_MODE: boolean =
  String(rawDevMode ?? '')
    .trim()
    .toLowerCase() === 'true';

// Fallback: si no está definido VITE_DEV_MODE, asumimos modo dev en localhost/no producción
if (rawDevMode == null && typeof window !== 'undefined') {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';
  const isProd = (import.meta.env as any).PROD === true;
  if (isLocalhost && !isProd) {
    DEV_MODE = true;
  }
}

// Exponer bandera global para poder inspeccionarla y compartirla entre componentes
if (typeof window !== 'undefined') {
  window.__DDD_DEV_MODE__ = DEV_MODE;
  // Log visible en consola para depuración
  // (aparece siempre una vez al cargar la app)
  // eslint-disable-next-line no-console
  console.log('[DDD] DEV_MODE:', DEV_MODE, 'raw VITE_DEV_MODE:', rawDevMode);
}

export function isDevModeEnabled(): boolean {
  return typeof window !== 'undefined'
    ? !!window.__DDD_DEV_MODE__
    : DEV_MODE;
}

export function getDevModeFlag(): boolean {
  return isDevModeEnabled();
}
