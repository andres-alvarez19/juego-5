# Guía de Sprites

Los sprites son los elementos visuales que componen el juego. Su correcta gestión es crucial para el rendimiento y la apariencia del juego.

## Formato y Ubicación

-   Los sprites originales (tiras de sprites o imágenes individuales) se encuentran en `Daring Dungeon Delver/public/entities/`.
-   Estos sprites se procesan mediante scripts de Python para generar **Atlas de Textura**.
-   Los atlas generados se guardan en `Daring Dungeon Delver/public/atlas/`.

## Atlas de Textura

Un atlas de textura es una imagen grande que contiene múltiples sprites más pequeños. El juego carga el atlas una sola vez y luego renderiza las diferentes partes de la imagen para mostrar los sprites. Esto es mucho más eficiente que cargar cientos de imágenes pequeñas.

El proyecto utiliza atlas en formato JSON, que define las coordenadas y el tamaño de cada frame dentro de la imagen del atlas.

## Carga de Sprites en el Juego

Todos los atlas y sprites se cargan en la escena `Preloader` usando los métodos de carga de Phaser.

```typescript
// filepath: Daring Dungeon Delver/src/game/scenes/Preloader.ts
// ...existing code...
// Hero sprites - atlas con frames normalizados y centrados
this.load.atlas('hero_idle', 'atlas/hero_idle.png?v=2', 'atlas/hero_idle_centered.json?v=2');
this.load.atlas('hero_run', 'atlas/hero_run.png?v=2', 'atlas/hero_run_centered.json?v=2');

// Enemy sprites - atlas con frames recortados (64x64)
this.load.atlas('orc', 'atlas/orc.png', 'atlas/orc_64.json');

// Imágenes individuales
this.load.image('coin', 'entities/rewards/normal coin.png');
// ...existing code...
```

## Creación o Modificación de Sprites

1.  Coloca el nuevo archivo de imagen (ej. `new_enemy.png`) en el directorio apropiado dentro de `Daring Dungeon Delver/public/entities/`.
2.  Modifica uno of los scripts de generación de atlas (ej. `Daring Dungeon Delver/generate_atlas.py`) para incluir tu nuevo sprite en un atlas existente o para crear uno nuevo.
3.  Ejecuta el script para generar los archivos `.png` y `.json` del atlas.
4.  Añade la línea de carga correspondiente en `Preloader.ts`.
