# Guía de Servicios

Los "servicios" en este proyecto son módulos que encapsulan una lógica de negocio específica o la interacción con una API externa.

## Cliente de API

El servicio principal para la comunicación con el backend es el `ApiClient`. Este cliente está diseñado para ser una capa de bajo nivel que maneja las peticiones HTTP, la autenticación y los reintentos.

Una instancia preconfigurada, `gameLabClient`, se exporta desde `Daring Dungeon Delver/src/integration/gameLabClient.ts` para ser utilizada en toda la aplicación.

## Stores de Pinia como Servicios de Fachada

Los stores de Pinia (`Daring Dungeon Delver/src/stores/`) actúan como una fachada (Facade) sobre el `ApiClient`. Encapsulan la lógica de obtención y gestión de un dominio de datos específico.

Por ejemplo, `scoreStore` es responsable de:
-   Gestionar el estado relacionado con las puntuaciones (`scores`, `bestScores`, `isLoading`, `error`).
-   Exponer acciones (`fetchScores`, `fetchLeaderboard`) que los componentes de la UI pueden llamar sin necesidad de conocer los detalles de la implementación de la API.

## Creación de un Nuevo Servicio

Si necesitas interactuar con un nuevo conjunto de endpoints de la API o gestionar un nuevo dominio de estado global:

1.  **Crea un nuevo store de Pinia** en `Daring Dungeon Delver/src/stores/`.
2.  Define el `state`, `getters` y `actions` necesarios.
3.  Dentro de las acciones, utiliza el `gameLabClient` para realizar las llamadas a la API.
4.  Maneja los estados de carga y error dentro del store.
5.  Usa el nuevo store en los componentes de Vue correspondientes.
