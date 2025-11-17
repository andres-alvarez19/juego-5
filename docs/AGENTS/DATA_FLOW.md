# Flujo de Datos

Esta sección describe cómo fluyen los datos a través de la aplicación.

## Flujo de Datos de la UI

1.  **Vista (Componente Vue)**: Un componente en `Daring Dungeon Delver/src/views/` o `Daring Dungeon Delver/src/components/` necesita mostrar o modificar datos.
2.  **Acción (Store de Pinia)**: El componente llama a una acción de un store de Pinia ubicado en `Daring Dungeon Delver/src/stores/`. Por ejemplo, `scoreStore.fetchLeaderboard()`.
3.  **Petición a la API**: La acción del store utiliza el `gameLabClient` para realizar una petición al backend.
4.  **Mutación de Estado**: Una vez que la API responde, la acción del store actualiza el estado (`state`) con los nuevos datos.
5.  **Reactividad**: Gracias a la reactividad de Pinia y Vue, la vista que depende de ese estado se actualiza automáticamente para reflejar los nuevos datos.

## Flujo de Datos del Juego (Phaser)

1.  **Carga de Assets**: La escena `Preloader` carga todos los assets necesarios (imágenes, atlas, sonidos) al inicio.
2.  **Creación de Escena**: Cada escena (`Phaser.Scene`) inicializa sus propios objetos de juego (sprites, grupos, texto) en su método `create()`.
3.  **Bucle de Juego (`update`)**: El método `update()` de la escena se ejecuta en cada fotograma. Aquí es donde se gestiona la entrada del usuario, la física, las colisiones y la lógica de la IA de los enemigos.
4.  **Comunicación UI-Juego**: La comunicación entre la UI de Vue y el juego de Phaser se puede lograr a través de un sistema de eventos o llamando directamente a funciones expuestas. Por ejemplo, el juego puede emitir un evento 'game-over' con la puntuación, que es capturado por la UI de Vue para mostrar la pantalla de fin de partida y enviar la puntuación al backend.
