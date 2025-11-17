# Desarrollo del nivel en Phaser

## Objetivo

Implementar una escena de juego en Phaser 3 con física Matter que cargue el mapa `Nivel_2.tmj` 1:1, renderice el fondo, convierta colisiones, instancie héroe, monedas, lanzas, puertas y enemigos con los comportamientos definidos: patrulla, persecución con visión y un “seeker” con pathfinding.

## Recursos

* Mapa Tiled: `assets/maps/Nivel_2.tmj`
* Fondo: `assets/images/2_level_mini_bg.png`
* Sprites: `hero`, `goblin`, `coin`, `big_coin`, `spear` (nombres tentativos, ajustar a arte disponible)

## Configuración de escena

1. Cargar `tmj` y fondo. Dibujar `fondo` en (0,0), `origin(0,0)`.
2. Límites de mundo y cámara: 1587×1049.
3. **Colisiones**: crear cuerpos estáticos a partir de `colliders` (rect y polígonos).
4. **Puertas (`door`)**: crear sensores estáticos. Propiedades por objeto:

   * `doorId:string`, `targetId:string`.
     Al colisionar el jugador o enemigo con una puerta, teletransportar al centro de la puerta destino y anular velocidad.
5. **Héroe (`hero`)**: usar el punto con `spawn:true` como posición inicial.
6. **Monedas**:

   * `coins`: elipses normales. Al recoger: sumar oro y destruir objeto.
   * `big_coins`: elipses grandes. Dan más oro.
7. **Lanzas (`spears`)**: rectángulos recomendados. Al colisionar con goblin: eliminar goblin y otorgar puntaje. Si se mantienen elipses, ajustar el collider al sprite.
8. **Enemigos (`enemies`)**:

   * Leer cada punto y sus props.

     * `type:"patrol"`: patrulla por `pathId` leyendo puntos en `patrol` o `patrol_2` ordenados por `order`. Estados: `PATROL → CHASE → SEARCH`.
     * `type:"seeker"`: conoce siempre la posición del héroe, navega con pathfinding por celdas, usa puertas si conviene. Recalcula cada `replanMs`.

## IA y visión

* **Detección**: Radio `chaseRadius` y cono `fov` en grados.
* **Línea de visión**: `Matter.Query.ray(staticBodies, enemy→hero)`; si el primer impacto está antes del héroe no hay visión.
* **Estados**:

  * `PATROL`: avanzar por waypoints; si ve al héroe dentro de radio/FOV/LOS, pasar a `CHASE`.
  * `CHASE`: seguir al héroe; si pierde visión o distancia excede `loseRadius`, pasar a `SEARCH`.
  * `SEARCH`: ir al último punto visto; si no lo localiza, volver al waypoint más cercano y a `PATROL`.

## Pathfinding del “seeker”

* Construir grilla a partir de `colliders` con **cell size 16 px** por defecto (no se define en TMJ).
* Biblioteca sugerida: `pathfinding` (A*).
* Recalcular ruta cada `replanMs` ms o si el héroe se aleja N celdas.
* Fallback: probar rutas via `door` (entrada→salida → objetivo) y elegir la de menor longitud.

## Hooks y API esperada

* `create()`:

  * `loadMapAndBackground()`
  * `buildStaticCollidersFromLayer('colliders')`
  * `setupDoorsFromLayer('door')`
  * `spawnHeroFromLayer('hero')`
  * `spawnCoinsFromLayer('coins','big_coins')`
  * `spawnSpearsFromLayer('spears')`
  * `spawnEnemiesFromLayer('enemies', { patrolLayers:['patrol','patrol_2'] })`
  * `setupCameraFollow(hero)`
* `update(time, delta)`:

  * `updateEnemiesAI(delta)` → por cada enemigo ejecutar `update()` con su FSM.
  * Recolectar monedas, chequear lanzas vs goblins, puertas y teletransporte.

## Aceptación

* El héroe spawnea en `hero.spawn:true`.
* Los patrulleros siguen sus rutas (`order`) y cambian a persecución con **radio + FOV + LOS**.
* El seeker persigue navegando evitando muros y usando puertas cuando es mejor camino.
* Monedas suman oro. Big coins suman más.
* Las lanzas eliminan goblins y suman puntaje.
* No hay penetración a través de `colliders`.
* Cámara sigue al héroe y no sale del mundo.
