# Prompts para Tareas de Frontend

## Crear un nuevo componente Vue

"Crea un nuevo componente de Vue 3 llamado `PlayerProfile.vue` en `Daring Dungeon Delver/src/components/`. Debe usar `<script setup>` y TypeScript. El componente debe mostrar el nombre de usuario y el nivel. Por ahora, usa datos de ejemplo. El componente debe seguir las guías de estilo del proyecto."

## Añadir una nueva vista

"Crea una nueva vista de Vue llamada `LeaderboardView.vue` en `Daring Dungeon Delver/src/views/`. Esta vista debe usar el store `scoreStore` para obtener y mostrar el leaderboard del juego. Muestra una lista de las 10 mejores puntuaciones con el nombre del jugador y su puntuación. Maneja los estados de carga y error."

## Modificar un store de Pinia

"Modifica el `scoreStore` en `Daring Dungeon Delver/src/stores/scoreStore.ts`. Añade una nueva acción llamada `submitScore` que acepte un `score` de tipo `number`. Esta acción debe usar `gameLabClient` para hacer una petición POST al endpoint `/scores` con el score. Maneja los posibles errores de la API."
