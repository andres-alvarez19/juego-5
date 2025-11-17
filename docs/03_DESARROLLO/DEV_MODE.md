# Modo de Desarrollo (DEV MODE)

## 🎯 Propósito

El modo de desarrollo permite ejecutar el juego localmente sin necesidad de que el backend de UfroGameLab esté disponible. Esto es útil para desarrollo y pruebas locales.

## ⚙️ Configuración

### Activar Modo DEV

1. Asegúrate de que el archivo `.env.development` existe con el siguiente contenido:

```bash
VITE_DEV_MODE=true
```

2. Reinicia el servidor de desarrollo:

```bash
pnpm dev
```

### Desactivar Modo DEV (Producción)

1. En el archivo `.env.production`, asegúrate de que:

```bash
VITE_DEV_MODE=false
```

2. Construye para producción:

```bash
pnpm build
```

## 🔧 Funcionalidades en Modo DEV

Cuando `VITE_DEV_MODE=true`, el sistema hace bypass de las siguientes llamadas API:

### 1. **Autenticación (`validate`)**
- ✅ Retorna automáticamente: `{ valid: true, user: { id: 'dev-user-123', name: 'Dev User' } }`
- ❌ No hace llamada a `https://api.ufrogamelab.cl/auth/validate`

### 2. **Inicio de Sesión (`startSession`)**
- ✅ Retorna: `{ session_id: 'dev-session-{timestamp}', status: 'active' }`
- ❌ No hace llamada a `/sessions/start`

### 3. **Fin de Sesión (`endSession`)**
- ✅ Retorna: `{ session_id: '...', status: 'completed' }`
- ❌ No hace llamada a `/sessions/end`

### 4. **Reporte de Puntaje (`reportScore`)**
- ✅ Retorna: `{ score_id: 'dev-score-{timestamp}', status: 'recorded' }`
- ❌ No hace llamada a `/scores/report`
- ⚠️ Los puntajes NO se guardan en la base de datos

### 5. **Tabla de Clasificación (`getLeaderboard`)**
- ✅ Retorna datos de prueba:
  ```json
  [
    {
      "user_id": "dev-user-1",
      "user_name": "Dev Player 1",
      "score": 5000,
      "level": 5,
      "mode": "campaign"
    },
    {
      "user_id": "dev-user-2",
      "user_name": "Dev Player 2",
      "score": 3500,
      "level": 3,
      "mode": "single-level"
    }
  ]
  ```
- ❌ No hace llamada a `/leaderboard/{gameId}`

### 6. **Puntajes del Usuario (`getMyScores`)**
- ✅ Retorna datos de prueba del usuario de desarrollo
- ❌ No hace llamada a `/scores/{gameId}/user/{userId}`

## 📊 Logs de Consola

En modo DEV, verás logs en la consola del navegador:

```
[DEV MODE] GameLabClient running in development mode - API calls will be bypassed
[DEV MODE] Bypassing authentication - using dev user
[DEV MODE] Bypassing authentication validation
[DEV MODE] Bypassing session start { user_id: 'dev-user-123', game_id: 'ddd', ... }
[Game Scene] Starting with mode: single-level level: 2
[Game Scene] Loading level: 2
```

## 🚀 Flujo de Desarrollo

### Inicio del Juego
1. Usuario navega a `/ddd/play`
2. GameView detecta `VITE_DEV_MODE=true`
3. Crea usuario de desarrollo automáticamente
4. Hace bypass de autenticación
5. Inicia sesión de desarrollo
6. Carga el juego Phaser con el nivel seleccionado

### Durante el Juego
- Todas las llamadas API se registran en la consola pero no se ejecutan
- Los puntajes se acumulan localmente
- Los eventos de nivel completado y game over funcionan normalmente

### Fin del Juego
- Se simula el reporte de puntaje
- Se simula el fin de sesión
- Se regresa al menú de Vue

## ⚠️ Advertencias

### NO usar en Producción
- ⛔ **NUNCA** desplegar con `VITE_DEV_MODE=true`
- ⛔ Esto permitiría a los usuarios jugar sin autenticación
- ⛔ Los puntajes no se guardarían en la base de datos

### Verificación Pre-Deployment

Antes de hacer deploy, verifica:

```bash
# Verificar que .env.production tenga:
cat .env.production | grep VITE_DEV_MODE
# Debe mostrar: VITE_DEV_MODE=false

# O verificar en el build:
pnpm build
# Buscar en los logs que no aparezca "[DEV MODE]"
```

## 🛠️ Troubleshooting

### El modo DEV no se activa

1. Verifica que `.env.development` existe
2. Reinicia el servidor de desarrollo
3. Limpia la caché del navegador (Ctrl + Shift + Delete)
4. Verifica en la consola que aparece: `[DEV MODE] GameLabClient running in development mode`

### Errores de autenticación en modo DEV

Si aún ves errores de autenticación:
1. Abre la consola del navegador
2. Verifica que `gameLabClient.isDevMode()` retorna `true`
3. Verifica que el userStore tiene un usuario: `localStorage` o `sessionStorage`

### El juego no carga en modo DEV

1. Abre las DevTools del navegador (F12)
2. Ve a la pestaña Console
3. Busca errores de Phaser o TypeScript
4. Verifica que aparezcan los logs:
   - `[DEV MODE] Bypassing authentication validation`
   - `[Game Scene] Starting with mode: ...`

## 📝 Archivos Modificados

```
.env.development          # VITE_DEV_MODE=true
.env.production           # VITE_DEV_MODE=false
.env.example              # Documentación de la variable
src/services/GameLabClient.ts  # Lógica de bypass
src/views/ddd/GameView.vue     # Inicialización de usuario dev
```

## 🔄 Cambiar entre Modos

### De DEV a Producción
```bash
# Opción 1: Cambiar .env.development
echo "VITE_DEV_MODE=false" >> .env.development

# Opción 2: Usar .env.production
pnpm build  # Automáticamente usa .env.production
```

### De Producción a DEV
```bash
# Restaurar .env.development
echo "VITE_DEV_MODE=true" > .env.development
pnpm dev
```

## 📚 Referencias

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vue Environment Variables](https://cli.vuejs.org/guide/mode-and-env.html)
- Contrato API: `docs/contrato_apiV2.md`
