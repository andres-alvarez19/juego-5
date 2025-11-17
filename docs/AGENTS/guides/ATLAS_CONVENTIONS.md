# Convenciones para Atlas de Sprites

Para asegurar que las animaciones de los personajes sean fluidas y fáciles de manejar, se siguen convenciones específicas al generar los atlas de sprites, especialmente para el héroe.

## Atlas del Héroe (`hero_*`)

Los atlas del héroe se generan con el script `generate_hero_atlas_normalized.py`.

### Convenciones Clave:

1.  **Tamaño de Frame Fijo**: Todos los frames se normalizan a un tamaño fijo (ej. 16x17 píxeles). Esto es crucial para que el punto de anclaje (`origin`) y el cuerpo de físicas (`physics body`) no cambien de tamaño entre frames de animación.
2.  **Alineación**:
    -   **Horizontal**: El sprite se centra horizontalmente dentro del frame.
    -   **Vertical**: El sprite se alinea con el borde inferior del frame.
3.  **Punto de Apoyo Compartido**: Gracias a la normalización, todos los frames de todas las animaciones del héroe (idle, run, etc.) comparten el mismo punto de apoyo relativo, lo que evita que el personaje "flote" o se "hunda" al cambiar de animación.

El script se encarga de tomar los sprites originales, que pueden tener diferentes dimensiones, y los coloca en un frame normalizado siguiendo estas reglas antes de construir el atlas final.

## Otros Atlas (Enemigos, etc.)

Para otros sprites como los enemigos (ej. orco), se puede usar un enfoque más simple con frames de tamaño fijo, como se ve en `generate_atlas.py`.

-   **Orc Atlas**: Se generan frames de 64x64. Los sprites originales se recortan y se redimensionan para encajar en estos frames.

## ¿Por qué estas convenciones?

-   **Animación Suave**: Evita saltos visuales al cambiar entre animaciones.
-   **Físicas Consistentes**: El tamaño del cuerpo de físicas del sprite no necesita ser ajustado en cada frame.
-   **Simplifica el Código**: La creación de animaciones en Phaser se vuelve más sencilla al no tener que lidiar con offsets y tamaños variables para cada frame.
