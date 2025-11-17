# Guía para crear mapas en Tiled para Daring Dungeon Delver

Esta guía explica cómo estructurar y configurar los mapas en Tiled para que funcionen correctamente en el juego Daring Dungeon Delver.

## Requisitos generales
- **Formato:** Exporta el mapa en formato `.tmj` (JSON de Tiled).
- **Orientación:** Usa orientación `orthogonal`.
- **Tamaño:** Define el ancho y alto del mapa según las necesidades del nivel.
- **Tile size:** Usa tileheight y tilewidth en 1 para mapas basados en píxeles.

## Capas necesarias
El mapa debe contener las siguientes capas, cada una con un propósito específico:

### 1. Capa de fondo (`fondo`)
- Tipo: `imagelayer`
- Imagen de fondo del nivel.
- Propiedades: `image`, `imagewidth`, `imageheight`, `offsetx`, `offsety`.

### 2. Colisiones (`colliders`)
- Tipo: `objectgroup`
- Objetos rectangulares o polígonos que definen las paredes y límites del nivel.
- Propiedad obligatoria: `type: wall` en las propiedades de la capa.
- Cada objeto debe tener: `x`, `y`, `width`, `height`.

### 3. Monedas (`coins`)
- Tipo: `objectgroup`
- Objetos tipo `ellipse` para cada moneda.
- Cada objeto debe tener: `x`, `y` (posición de la moneda).

### 4. Monedas grandes (`big_coins`)
- Tipo: `objectgroup`
- Objetos tipo `ellipse` para cada moneda grande.
- Cada objeto debe tener: `x`, `y`.

### 5. Patrullas (`patrol`, `patrol_2`)
- Tipo: `objectgroup`
- Objetos que definen los puntos de patrulla de los enemigos.
- Cada objeto debe tener: `x`, `y`.

### 6. Enemigos (`enemies`)
- Tipo: `objectgroup`
- Objetos que definen la posición inicial de los enemigos.
- Cada objeto debe tener: `x`, `y`.

### 7. Héroe (`hero`)
- Tipo: `objectgroup`
- Objeto que define la posición inicial del héroe.
- Cada objeto debe tener: `x`, `y`.

### 8. Puertas (`door`)
- Tipo: `objectgroup`
- Objetos que definen la posición de las puertas.
- Propiedad obligatoria en la capa: `type: door`.
- Cada objeto debe tener: `x`, `y`.

### 9. Trampas (`spears`)
- Tipo: `objectgroup`
- Objetos que definen la posición de las trampas.
- Cada objeto debe tener: `x`, `y`.

## Recomendaciones
- **Nombres de capas:** Usa los nombres indicados exactamente para cada capa.
- **Visibilidad:** Las capas pueden estar visibles o no, según lo que se requiera mostrar en el editor.
- **Propiedades de objetos:** No es necesario asignar nombre o tipo a cada objeto, salvo que el motor lo requiera para lógica especial.
- **Polígonos:** Para colisiones complejas, usa objetos tipo `polygon`.

## Ejemplo de estructura mínima
```
- fondo (imagelayer)
- colliders (objectgroup, type: wall)
- coins (objectgroup)
- big_coins (objectgroup)
- patrol (objectgroup)
- patrol_2 (objectgroup)
- enemies (objectgroup)
- hero (objectgroup)
- door (objectgroup, type: door)
- spears (objectgroup)
```

## Exportación
- Exporta el mapa en formato `.tmj` y colócalo en la carpeta `public/assets/maps/`.

---

**Siguiendo esta estructura, el motor del juego podrá cargar y utilizar correctamente los mapas creados en Tiled.**

## Atributos de entidad por capa
A continuación, se indican los atributos relevantes para cada objeto en cada capa:

### Fondo (`fondo`)
- `image`: nombre del archivo de la imagen de fondo.
- `imagewidth`, `imageheight`: dimensiones de la imagen.
- `offsetx`, `offsety`: desplazamiento de la imagen.

### Colisiones (`colliders`)
- Cada objeto: `x`, `y`, `width`, `height` (rectángulo) o `polygon` (polígono).
- Propiedad de la capa: `type: wall`.

### Monedas (`coins`)
- Cada objeto: `ellipse: true`, `x`, `y`.

### Monedas grandes (`big_coins`)
- Cada objeto: `ellipse: true`, `x`, `y`, `width`, `height`.

### Patrullas (`patrol`, `patrol_2`)
- Cada objeto: `point: true`, `x`, `y`.
- Propiedad: `pathId` (int).

### Enemigos (`enemies`)
- Cada objeto: `x`, `y`.
- Propiedades:
  - `type`: tipo de enemigo (`patrol`, `seeker`, etc.).
  - `chaseRadius` (int): radio de persecución.
  - `loseRadius` (int): radio de pérdida.
  - `fov` (int): ángulo de visión.
  - `speed` (float): velocidad.
  - `replanMs` (int): tiempo de replanificación (ms).
  - `spawn` (bool): aparición al inicio.
  - `pathId` (int, opcional): grupo de patrulla.

### Héroe (`hero`)
- Cada objeto: `x`, `y`.
- Propiedades: `type: hero`, `spawn: true`.

### Puertas (`door`)
- Cada objeto: `x`, `y`, `width`, `height`.
- Propiedades: `doorId` (cadena), `targetId` (cadena).
- Propiedad de la capa: `type: door`.

### Trampas (`spears`)
- Cada objeto: `ellipse: true`, `x`, `y`, `width`, `height`.

---
Asegúrate de que cada entidad tenga los atributos indicados para una correcta integración con el motor.