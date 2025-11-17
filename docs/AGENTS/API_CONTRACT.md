# Contrato de la API

La comunicación con el backend se gestiona a través de un cliente de API centralizado.

## Cliente de API

El cliente principal es `gameLabClient`, una instancia de la clase `ApiClient`. Este cliente encapsula la lógica para realizar peticiones HTTP al backend de GameLab.

### Características

-   **Autenticación**: Adjunta automáticamente el token de autenticación en las cabeceras de las peticiones.
-   **Reintentos**: Implementa una estrategia de reintentos con *exponential backoff* para manejar errores transitorios de red o servidor.
-   **Manejo de Errores**: Lanza errores personalizados de tipo `ApiError` para facilitar la depuración.

## Uso

Los stores de Pinia, como `scoreStore`, utilizan `gameLabClient` para obtener y enviar datos, como las puntuaciones del leaderboard.

```typescript
// Daring Dungeon Delver/src/stores/scoreStore.ts
// ...
const scores = await gameLabClient.getLeaderboard(gameId, limit);
this.bestScores = scores;
// ...
```

## Documentación de Endpoints

Para ver detalles sobre los endpoints disponibles, estructuras de datos y códigos de error, consulta el documento de contrato de la API: `docs/02_API/contrato_apiV2.md`.
