# Flujo de Trabajo de Desarrollo

Sigue este flujo para contribuir al proyecto de manera eficiente.

## 1. Configuración del Entorno

1.  Clona el repositorio.
2.  Instala las dependencias con `pnpm install`.
3.  Copia `.env.development.example` a `.env.development` si es necesario y ajusta las variables de entorno.

## 2. Desarrollo

1.  Inicia el servidor de desarrollo:
    ```sh
    pnpm dev
    ```
2.  Crea una nueva rama para tu tarea (ej. `feature/new-enemy` o `fix/player-bug`).
3.  Implementa los cambios siguiendo la [Guía de Estilo](STYLE_GUIDE.md) y la [Arquitectura](ARCHITECTURE.md) del proyecto.
4.  Si añades nuevos sprites o modificas existentes, puede que necesites ejecutar los scripts de generación de atlas:
    ```sh
    python "Daring Dungeon Delver/generate_atlas.py"
    ```

## 3. Pruebas

1.  Añade pruebas unitarias para la nueva lógica en el directorio `Daring Dungeon Delver/tests/`.
2.  Ejecuta todas las pruebas para asegurarte de no haber introducido regresiones:
    ```sh
    pnpm test
    ```

## 4. Modo de Desarrollo (DEV_MODE)

El proyecto tiene un modo de desarrollo controlado por la variable `VITE_DEV_MODE` en `.env.development`. Este modo puede activar funcionalidades especiales para facilitar el desarrollo. Consulta `docs/03_DESARROLLO/DEV_MODE.md` para más detalles.

## 5. Envío de Cambios

1.  Confirma tus cambios con un mensaje descriptivo.
2.  Envía tu rama al repositorio remoto.
3.  Crea un *Pull Request* para que tus cambios sean revisados e integrados.
