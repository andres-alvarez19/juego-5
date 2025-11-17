# Prompts para Tareas de Refactorización

## Refactorizar una función a un composable de Vue

"La lógica para formatear fechas en el componente `History.vue` está duplicada. Extrae esta lógica a un nuevo composable de Vue llamado `useDateFormatter.ts` en `Daring Dungeon Delver/src/composables/`. El composable debe exportar una función `formatDate(date: Date): string`. Luego, refactoriza `History.vue` para que use este nuevo composable."

## Centralizar constantes

"En varias escenas de Phaser dentro de `Daring Dungeon Delver/src/game/scenes/`, se definen constantes para las velocidades de los personajes (ej. `PLAYER_SPEED`, `ENEMY_SPEED`). Crea un nuevo archivo `Daring Dungeon Delver/src/game/constants.ts` y mueve todas estas constantes allí. Luego, importa las constantes desde este archivo central en las escenas correspondientes."

## Simplificar manejo de errores

"En `Daring Dungeon Delver/src/stores/scoreStore.ts`, la lógica para manejar errores de la API en `fetchScores` y `fetchLeaderboard` es casi idéntica. Refactoriza esta lógica en un método privado dentro del store llamado `handleApiError(error: unknown)` para reducir la duplicación de código."
