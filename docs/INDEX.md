# Índice de Documentación - Daring Dungeon Delver

Este índice organiza toda la documentación del proyecto para facilitar el mantenimiento y las modificaciones del código.

## 📋 Estructura General

```
docs/
├── INDEX.md                      # Este archivo - punto de entrada
├── 01_ARQUITECTURA/              # Arquitectura del sistema
├── 02_API/                       # Contratos y documentación de API
├── 03_DESARROLLO/                # Guías de desarrollo
├── 04_NIVELES/                   # Documentación de niveles
├── 05_REQUERIMIENTOS/            # Requisitos y casos de uso
└── 06_PRUEBAS/                   # Documentación de testing
```

---

## 🏗️ 01. ARQUITECTURA

### [Sistema de Autenticación](./02_API/token_api.md)
- Sistema de tokens Bearer JWT
- Comunicación con Ufro GameLab
- Flujo de autenticación y renovación
- Seguridad y almacenamiento en memoria

### [Arquitectura Vue + Phaser](./03_DESARROLLO/arquitectura_vue_phaser.md)
- Integración Vue 3 + Phaser 3
- Store de estado (gameStore)
- Comunicación bidireccional Vue ↔ Phaser
- Escenas y flujo de juego

---

## 🔌 02. API

### [Contrato API v2](./02_API/contrato_api.md)
**Documentación consolidada de la API de Ufro GameLab**

#### Endpoints Disponibles:
1. **Autenticación**
   - Bearer Token (JWT)
   - postMessage para transferencia
   
2. **Actualizar Sesión**
   - `PUT /collection/my-games/{gameId}/session-update`
   - Parámetros: `gameSessionDurationSeconds`, `scoreAchieved`
   - Respuestas: 200, 400, 401, 403, 404, 500

3. **Leaderboard**
   - `GET /collection/leaderboards/{gameId}`
   - Query params: `limit` (opcional)
   - Respuestas: 200, 401, 404, 500

#### Archivos Relacionados:
- `src/services/GameLabClient.ts` - Cliente API
- `src/integration/` - Servicios de integración

---

## 💻 03. DESARROLLO

### [Modo de Desarrollo](./03_DESARROLLO/DEV_MODE.md)
**Desarrollo sin backend**

#### Activación:
```bash
# .env.development
VITE_DEV_MODE=true
```

#### Funcionalidades en DEV:
- Bypass de autenticación
- Datos mock para leaderboard
- Usuario de desarrollo automático
- Logs en consola

#### Desactivación para Producción:
```bash
# .env.production
VITE_DEV_MODE=false
```

---

### [Formato de Código](./03_DESARROLLO/formato_codigo.md)
**Convenciones del proyecto**

- ✅ Código en inglés (variables, métodos, clases)
- ✅ Comentarios y documentación en español
- ✅ Usar TypeScript estricto

---

### [Desarrollo de Niveles](./03_DESARROLLO/LEVEL_DEV.md)
**Guía técnica para implementar niveles en Phaser**

#### Elementos Principales:
1. **Configuración de Escena**
   - Carga de mapa Tiled (.tmj)
   - Configuración de física Matter.js
   - Límites de cámara

2. **Sistema de Colisiones**
   - Capas de colliders
   - Puertas de teletransporte
   - Sensores de lanzas

3. **IA de Enemigos**
   - Estados: PATROL → CHASE → SEARCH
   - Sistema de visión (FOV + LOS)
   - Pathfinding para seekers

4. **Assets Requeridos**
   - Mapa: `public/assets/maps/Nivel_X.tmj`
   - Fondo: `public/assets/backgrounds/X_level_mini_bg.png`
   - Sprites de héroe, enemigos, monedas, lanzas

---

## 🎮 04. NIVELES

### [Modo Campaña](./04_NIVELES/CAMPAIGN_MODE.md)
**Sistema de progresión de niveles**

#### Modos de Juego:
1. **Modo Campaña**
   - Secuencia: Nivel 2 → 3 → 4 → 5
   - Progresión automática al completar nivel
   - Condición de victoria: Recolectar todas las monedas

2. **Modo Selección de Nivel**
   - Jugar un nivel específico
   - Regreso al menú al completar

#### Archivos Clave:
- `src/stores/gameStore.ts` - Gestión de estado
- `src/views/ddd/GameView.vue` - Contenedor del juego
- `src/game/scenes/Game.ts` - Escena principal

---

### Niveles Implementados

#### [Nivel 2 - Base](./04_NIVELES/LEVEL2_INTEGRATION.md)
- **Dimensiones:** 1587×1049 px
- **Enemigos:** 3 (2 patrol + 1 seeker)
- **Rutas:** 2 (patrol, patrol_2)
- **Monedas:** 62 (normales + grandes)
- **Lanzas:** 3
- **Dificultad:** ⭐⭐

---

#### [Nivel 3 - Intermedio](./04_NIVELES/LEVEL3_INTEGRATION.md)
- **Dimensiones:** 1587×1049 px
- **Enemigos:** 4 (3 patrol + 1 seeker)
- **Rutas:** 3 (patrol, patrol_2, patrol_3)
- **Monedas:** 61 (30 normales + 8 grandes)
- **Lanzas:** 3
- **Puntaje máximo:** 700 puntos
- **Dificultad:** ⭐⭐⭐

**Novedad:** Tercera ruta de patrulla (patrol_3)

---

#### [Nivel 4 - Difícil](./04_NIVELES/LEVEL4_INTEGRATION.md)
- **Dimensiones:** 1587×1049 px
- **Enemigos:** 8 (6 patrol + 2 seeker)
- **Rutas:** 6 (patrol hasta patrol_6)
- **Monedas:** 95 (86 normales + 9 grandes)
- **Lanzas:** 5
- **Puertas:** 3 pares de teletransporte
- **Puntaje máximo:** 1310 puntos
- **Dificultad:** ⭐⭐⭐⭐

**Novedades:**
- 3 nuevas rutas (patrol_4, patrol_5, patrol_6)
- 2 seekers simultáneos
- Sistema de puertas complejo

---

#### [Nivel 5 - FINAL BOSS](./04_NIVELES/LEVEL5_INTEGRATION.md)
- **Dimensiones:** 1587×1049 px
- **Enemigos:** 11 (8 patrol + 3 seeker)
- **Rutas:** 8 (patron, patron_2 hasta patron_8)
- **Monedas:** 89 (78 normales + 11 grandes)
- **Lanzas:** 6
- **Puntaje máximo:** 1330 puntos
- **Dificultad:** ⭐⭐⭐⭐⭐

**Novedades Críticas:**
- ⚠️ Usa convención `patron_X` en lugar de `patrol_X`
- Fallback automático en código
- Máximo de rutas de patrulla (8)
- 3 seekers simultáneos (récord)

---

#### Nivel 1 - Tutorial (Pendiente)
**No implementado** - Assets disponibles: `1_level_mini_bg.png`

**Características Recomendadas:**
- 1-2 enemigos máximo
- Tutorial interactivo
- Muchas lanzas (4-5)
- Pocas monedas (20-30)

---

### Comparación de Niveles

| Nivel | Enemigos | Patrol | Seeker | Rutas | Monedas | Lanzas | Puntos | Dificultad |
|-------|----------|--------|--------|-------|---------|--------|--------|------------|
| 2     | 3        | 2      | 1      | 2     | 62      | 3      | 860    | ⭐⭐       |
| 3     | 4        | 3      | 1      | 3     | 61      | 3      | 700    | ⭐⭐⭐     |
| 4     | 8        | 6      | 2      | 6     | 95      | 5      | 1310   | ⭐⭐⭐⭐   |
| 5     | 11       | 8      | 3      | 8     | 89      | 6      | 1330   | ⭐⭐⭐⭐⭐ |

---

## 📝 05. REQUERIMIENTOS

### [Requerimientos y Casos de Uso](./05_REQUERIMIENTOS/Requerimientos_CU_diagramas.md)
**Documentación funcional completa**

#### Requerimientos Funcionales:
1. Control del personaje (teclado)
2. Recolección de objetos (oro, armas, gemas)
3. Sistema de enemigos con IA
4. Detección de colisiones
5. Sistema de vidas (3 vidas)
6. Autenticación con Ufro GameLab
7. Persistencia de puntajes
8. Registro de horas de juego
9. 5 mapas/niveles distintos
10. Incremento de dificultad

#### Requerimientos No Funcionales:
- Performance: 60 FPS (meta), ≥30 FPS (aceptable)
- Tiempo de carga: <2-3s en desktop 4G/Wi-Fi
- Compatibilidad: Chromium última versión estable

#### Casos de Uso Principales:
1. Desplegar juego en modo campaña
2. Desplegar juego en modo selector de niveles
3. Desplegar listado de puntajes
4. Filtrar puntajes por valores mayores
5. Guardar puntaje de sesión

#### Diagramas:
- Diagrama de clases
- Diagrama de secuencia
- Diagramas de flujo

---

## 🧪 06. PRUEBAS

### [Informe de Testing](./06_PRUEBAS/test_report.md)
**Cobertura de pruebas automatizadas**

#### Áreas Cubiertas:
1. **Servicios de Integración**
   - `LeaderboardsService.spec.ts`
   - `SessionService.spec.ts`

2. **Cliente HTTP**
   - `ApiClient.spec.ts`
   - Manejo de códigos 401, 429, 5xx
   - Sistema de reintentos

3. **Gestión de Sesión**
   - `SessionManager.spec.ts`
   - Heartbeats con sendBeacon
   - Acumulación de tiempo

4. **E2E**
   - `postmessage_handshake.spec.ts`
   - Handshake completo
   - Renovación automática de token

#### Ejecución:
```bash
npm install
npm run test
npm run test -- {pattern}  # Para casos específicos
```

---

## 🚀 Guía Rápida de Inicio

### Para Desarrolladores Nuevos:

1. **Leer primero:**
   - [INDEX.md](./INDEX.md) ← Estás aquí
   - [Arquitectura Vue + Phaser](./03_DESARROLLO/arquitectura_vue_phaser.md)
   - [Modo de Desarrollo](./03_DESARROLLO/DEV_MODE.md)

2. **Para trabajar con niveles:**
   - [Modo Campaña](./04_NIVELES/CAMPAIGN_MODE.md)
   - [Desarrollo de Niveles](./03_DESARROLLO/LEVEL_DEV.md)
   - Documentos de niveles específicos (LEVEL2-5_INTEGRATION.md)

3. **Para integración con API:**
   - [Sistema de Autenticación](./02_API/token_api.md)
   - [Contrato API v2](./02_API/contrato_api.md)
   - [Informe de Testing](./06_PRUEBAS/test_report.md)

4. **Para entender el contexto:**
   - [Requerimientos y Casos de Uso](./05_REQUERIMIENTOS/Requerimientos_CU_diagramas.md)

---

## 📁 Organización de Archivos por Reorganizar

Los siguientes archivos serán consolidados/movidos:

### Archivos Duplicados a Consolidar:
- ~~`contrato_api.md`~~ + ~~`contrato_apiV2.md`~~ → `02_API/contrato_api.md` ✅

### Archivos a Mover:
1. **Arquitectura:**
   - `token_api_informe.md` → `02_API/token_api.md`

2. **Desarrollo:**
   - `DEV_MODE.md` → `03_DESARROLLO/DEV_MODE.md`
   - `formato_codigo.md` → `03_DESARROLLO/formato_codigo.md`
   - `LEVEL_DEV.md` → `03_DESARROLLO/LEVEL_DEV.md`

3. **Niveles:**
   - `CAMPAIGN_MODE.md` → `04_NIVELES/CAMPAIGN_MODE.md`
   - `LEVEL2_INTEGRATION.md` → `04_NIVELES/LEVEL2_INTEGRATION.md`
   - `LEVEL3_INTEGRATION.md` → `04_NIVELES/LEVEL3_INTEGRATION.md`
   - `LEVEL4_INTEGRATION.md` → `04_NIVELES/LEVEL4_INTEGRATION.md`
   - `LEVEL5_INTEGRATION.md` → `04_NIVELES/LEVEL5_INTEGRATION.md`

4. **Requerimientos:**
   - `Requerimientos_CU_diagramas.md` → `05_REQUERIMIENTOS/Requerimientos_CU_diagramas.md`

5. **Pruebas:**
   - `test_report.md` → `06_PRUEBAS/test_report.md`

---

## 🔄 Historial de Cambios

### 2025-11-11 - Reorganización Inicial
- Creación del INDEX.md
- Consolidación de contrato_api.md y contrato_apiV2.md
- Establecimiento de estructura de carpetas
- Documentación de niveles 2-5 integrados

---

## 💡 Convenciones de Documentación

### Formato de Archivos:
- Markdown (.md)
- Codificación UTF-8
- Líneas max 80-100 caracteres
- Bloques de código con syntax highlighting

### Nomenclatura:
- `MAYUSCULAS_SNAKE_CASE` para documentos principales
- `snake_case` para archivos técnicos
- Prefijos numéricos para carpetas (01_, 02_, etc.)

### Emojis en Títulos:
- 📋 Estructura/Índices
- 🏗️ Arquitectura
- 🔌 API/Integración
- 💻 Desarrollo
- 🎮 Niveles/Gameplay
- 📝 Requerimientos
- 🧪 Pruebas
- 🚀 Guías Rápidas
- 💡 Tips/Convenciones

---

## 📞 Contacto y Mantenimiento

**Responsables del Proyecto:**
- Andrés Álvarez Morales
- Enrique Pincheira

**Última Actualización:** 11 de noviembre de 2025

---

**Fin del Índice**
