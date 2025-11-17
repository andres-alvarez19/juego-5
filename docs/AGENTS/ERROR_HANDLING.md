# Guía de Manejo de Errores

El proyecto tiene una estrategia definida para manejar errores, especialmente en las interacciones con la API.

## Errores de Peticiones HTTP

Las peticiones a la API se realizan a través de wrappers que proporcionan un manejo de errores robusto.

### `safeFetch`

La función `safeFetch` es un wrapper sobre la `fetch` API nativa que incluye:
-   **Reintentos**: Reintenta peticiones fallidas (errores 5xx) un número configurable de veces.
-   **Errores Personalizados**: Lanza una instancia de `FetchError` que contiene el mensaje, el estado HTTP y un código de error si está disponible.
-   **No reintenta errores de cliente (4xx)** para evitar peticiones inútiles.

### `ApiClient`

La clase `ApiClient` es una abstracción de más alto nivel que utiliza una lógica similar:
-   Implementa reintentos con *exponential backoff*.
-   Lanza una instancia de `ApiError` que encapsula detalles de la petición fallida.

## Manejo de Errores en la UI

Los stores de Pinia, como `scoreStore`, deben capturar los errores lanzados por el cliente de la API en un bloque `try...catch`.

-   El error debe almacenarse en el estado del store (ej. `this.error`).
-   La UI debe reaccionar a este estado para mostrar un mensaje al usuario.
-   Proporciona un método para limpiar el error (ej. `clearError`).

```typescript
// Ejemplo en Daring Dungeon Delver/src/stores/scoreStore.ts
// ...
try {
  const scores = await gameLabClient.getLeaderboard(gameId, limit);
  this.bestScores = scores;
} catch (error) {
  this.error = error instanceof Error ? error.message : 'Failed to fetch leaderboard';
  console.error('Failed to fetch leaderboard:', error);
}
// ...
```
