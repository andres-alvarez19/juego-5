# Arquitectura del Proyecto

Daring Dungeon Delver está construido con las siguientes tecnologías y estructura:

-   **Motor de Juego**: [Phaser 3](https://phaser.io/phaser3). La lógica del juego se encuentra en `Daring Dungeon Delver/src/game/`.
-   **Framework Frontend**: [Vue 3](https://vuejs.org/) con [Vite](https://vitejs.dev/) como herramienta de construcción. Los componentes de la interfaz de usuario (UI) están en `Daring Dungeon Delver/src/views/` y `Daring Dungeon Delver/src/components/`.
-   **Lenguaje**: [TypeScript](https://www.typescriptlang.org/).
-   **Gestión de Estado**: [Pinia](https://pinia.vuejs.org/) para el estado global de la UI, como se ve en `Daring Dungeon Delver/src/stores/scoreStore.ts`.
-   **Scripts de Assets**: Se utilizan scripts de Python (`.py`) para generar los atlas de sprites. Ver `Daring Dungeon Delver/generate_atlas.py` y `Daring Dungeon Delver/generate_hero_atlas_normalized.py`.

## Estructura de Directorios Clave

-   `Daring Dungeon Delver/src/game/`: Contiene las escenas y la lógica principal del juego Phaser.
-   `Daring Dungeon Delver/src/views/`: Componentes de Vue que renderizan las vistas principales de la aplicación.
-   `Daring Dungeon Delver/src/stores/`: Módulos de estado de Pinia.
-   `Daring Dungeon Delver/src/integration/`: Clases para la comunicación con servicios externos, como `ApiClient.ts`.
-   `Daring Dungeon Delver/public/`: Assets estáticos del juego (imágenes, atlas, etc.).
-   `docs/`: Documentación general y del proyecto.
