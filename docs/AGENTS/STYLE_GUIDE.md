# Guía de Estilo de Código

Para mantener la consistencia y legibilidad del código, sigue estas directrices.

## TypeScript / JavaScript

-   **Linting**: El proyecto utiliza ESLint. Asegúrate de que tu código no genere errores de linting. Puedes ejecutar `pnpm lint` para verificarlo.
-   **Formato**: Se utiliza Prettier para el formateo automático del código. Configura tu editor para que formatee al guardar o ejecuta `pnpm format`.
-   **Convenciones**:
    -   Sigue las convenciones de nomenclatura y estilo existentes en el código base.
    -   Usa `PascalCase` para tipos, clases e interfaces.
    -   Usa `camelCase` para variables y funciones.
    -   Prefiere `const` sobre `let` si la variable no será reasignada.
    -   Utiliza importaciones de módulos ES6 (`import`/`export`).

## Vue

-   Sigue la [guía de estilo oficial de Vue](https://vuejs.org/style-guide/).
-   Nombra los componentes con `PascalCase`.
-   Utiliza la `<script setup>` y la API de Composición.

## Phaser

-   Organiza la lógica del juego en Escenas (`Phaser.Scene`).
-   Carga todos los assets en la escena `Preloader` (`Daring Dungeon Delver/src/game/scenes/Preloader.ts`).
