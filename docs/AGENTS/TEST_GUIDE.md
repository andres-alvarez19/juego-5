# Guía de Pruebas

El proyecto utiliza [Vitest](https://vitest.dev/) para las pruebas unitarias y de integración.

## Ubicación de las Pruebas

-   Los archivos de prueba se encuentran en el directorio `Daring Dungeon Delver/tests/`.
-   Los nombres de los archivos de prueba deben seguir el formato `*.test.ts` o `*.spec.ts`.

## Cómo Escribir Pruebas

-   Utiliza la sintaxis de `describe`, `it` y `expect` proporcionada por Vitest.
-   Para probar componentes de Vue, puedes usar `@vue/test-utils`.
-   Para probar la lógica del juego en Phaser, puedes necesitar mocks para las funcionalidades del motor.

## Ejecutar Pruebas

Puedes ejecutar las pruebas usando los scripts definidos en `Daring Dungeon Delver/package.json`:

-   **Ejecutar todas las pruebas una vez**:
    ```sh
    pnpm test
    ```

-   **Ejecutar pruebas en modo "watch"**:
    ```sh
    pnpm test:watch
    ```

-   **Ver el reporte de cobertura de pruebas**:
    ```sh
    pnpm coverage
    ```
    Esto generará un reporte en el directorio `coverage/`.
