import fs from 'node:fs';
import path from 'node:path';

const rootDir = process.cwd();
const envPath = path.resolve(rootDir, '.env');
const envDevPath = path.resolve(rootDir, '.env.development');

try {
const hasEnv = fs.existsSync(envPath);
const hasEnvDev = fs.existsSync(envDevPath);

// Regla de prioridad:
// 1) Si existe .env, sus valores deben tener preferencia.
//    Para evitar que Vite los sobrescriba con .env.development,
//    hacemos que .env.development sea una copia de .env.
if (hasEnv) {
  try {
    fs.copyFileSync(envPath, envDevPath);
    process.stdout.write('[ensure-env] Synced .env -> .env.development (priority: .env)\n');
  } catch {
    // Ignorar fallos silenciosamente
  }
}

// 2) Si NO existe .env pero SÍ existe .env.development,
//    lo usamos como fallback creando .env desde .env.development.
if (!hasEnv && hasEnvDev) {
  try {
    fs.copyFileSync(envDevPath, envPath);
    process.stdout.write('[ensure-env] Copied .env.development to .env as fallback\n');
  } catch {
    // Ignorar fallos silenciosamente
  }
}
} catch {
  // No interrumpir el flujo de Vite si algo falla aquí
}
