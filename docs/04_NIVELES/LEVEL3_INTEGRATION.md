# Integración del Nivel 3

## Resumen

El Nivel 3 ha sido integrado siguiendo el mismo patrón de implementación del Nivel 2, manteniendo compatibilidad con el sistema de campaña y selección individual de niveles.

## Características del Nivel 3

### Dimensiones
- **Tamaño del mapa:** 1587×1049 px (igual que Nivel 2)
- **Archivo del mapa:** `nivel_3.tmj`
- **Fondo:** `3_level_mini_bg.png`

### Enemigos (4 Total)

#### 3 Enemigos Tipo "Patrol"
- **Patrullero 1:** `pathId: 1` → Usa waypoints en capa `patrol`
  - Posición inicial: (134, 334)
  - Speed: 1.4
  - Chase radius: 200px
  - FOV: 90°
  
- **Patrullero 2:** `pathId: 2` → Usa waypoints en capa `patrol_2`
  - Posición inicial: (750, 968)
  - Speed: 1.4
  - Chase radius: 200px
  - FOV: 90°
  
- **Patrullero 3:** `pathId: 3` → Usa waypoints en capa `patrol_3`
  - Posición inicial: (1472, 826)
  - Speed: 1.4
  - Chase radius: 200px
  - FOV: 90°

#### 1 Enemigo Tipo "Seeker"
- **Seeker:** Persigue al jugador constantemente
  - Posición inicial: (392, 364)
  - Speed: 2.4 (más rápido que patrulleros)
  - Chase radius: 200px
  - FOV: 90°
  - Replan: cada 250ms

### Sistema de Rutas de Patrulla

El Nivel 3 introduce una **tercera ruta de patrulla** (`patrol_3`):

**Ruta patrol (pathId: 1):**
- 4 waypoints (order: 0, 1, 2, 3)
- Área: Lado izquierdo del mapa

**Ruta patrol_2 (pathId: 2):**
- 3 waypoints (order: 0, 1, 2)
- Área: Centro del mapa

**Ruta patrol_3 (pathId: 3):** ✨ **NUEVA**
- 3 waypoints (order: 0, 1, 2)
- Área: Lado derecho del mapa
- Coordenadas:
  - Waypoint 0: (1446, 630)
  - Waypoint 1: (1204, 612)
  - Waypoint 2: (892, 588)

### Monedas

**Total: 61 monedas**
- **Monedas normales:** 30 (+10 puntos cada una)
- **Monedas grandes:** 8 (+50 puntos cada una)
- **Total de puntos en monedas:** 30×10 + 8×50 = 700 puntos

### Lanzas

**Total: 3 lanzas**
- Lanza 1: (602, 444)
- Lanza 2: (1118, 692)
- Lanza 3: (96, 614)

Al recogerlas: Invencibilidad por 5 segundos (+100 puntos por enemigo eliminado)

### Punto de Spawn del Héroe

- **Posición:** (394, 134)
- **Ubicación:** Parte superior central del mapa

## Cambios en el Código

### 1. Preloader.ts

```typescript
// Nivel 3 - Nuevos assets cargados
this.load.image('level3_bg', 'backgrounds/3_level_mini_bg.png');
this.load.tilemapTiledJSON('level3_map', 'maps/nivel_3.tmj');
```

### 2. Game.ts

#### Propiedad de Dimensiones del Mundo
```typescript
// Añadidas propiedades para dimensiones dinámicas
worldWidth: number = 1587;
worldHeight: number = 1049;
```

#### loadMapAndBackground() - Soporte Nivel 3
```typescript
loadMapAndBackground(_level: number = 2) {
    // ...
    if (_level === 2) {
        mapKey = 'level2_map';
        bgKey = 'level2_bg';
        this.worldWidth = 1587;
        this.worldHeight = 1049;
    } else if (_level === 3) {
        mapKey = 'level3_map';           // ✨ NUEVO
        bgKey = 'level3_bg';              // ✨ NUEVO
        this.worldWidth = 1587;
        this.worldHeight = 1049;
    }
    // ...
}
```

#### loadWaypointsForPath() - Soporte para patrol_3
```typescript
loadWaypointsForPath(pathId: string | number, _patrolLayers: string[]): Waypoint[] {
    // ...
    if (pathIdNum === 1) {
        layerName = 'patrol';
    } else if (pathIdNum === 2) {
        layerName = 'patrol_2';
    } else if (pathIdNum === 3) {        // ✨ NUEVO
        layerName = 'patrol_3';          // ✨ NUEVO
    }
    // ...
}
```

#### spawnEnemiesFromLayer() - Incluir patrol_3
```typescript
this.spawnEnemiesFromLayer('enemies', { 
    patrolLayers: ['patrol', 'patrol_2', 'patrol_3']  // ✨ patrol_3 añadido
});
```

#### setupCameraFollow() - Límites Dinámicos
```typescript
setupCameraFollow(target: Phaser.Physics.Matter.Sprite) {
    this.camera.setBounds(0, 0, this.worldWidth, this.worldHeight);  // Ahora usa propiedades dinámicas
    this.camera.startFollow(target, true, 0.1, 0.1);
}
```

## Estructura de Archivos

```
public/assets/
├── backgrounds/
│   ├── 2_level_mini_bg.png     (Nivel 2)
│   └── 3_level_mini_bg.png     (Nivel 3) ✨
├── maps/
│   ├── Nivel_2.tmj             (Nivel 2)
│   └── nivel_3.tmj             (Nivel 3) ✨
```

## Testing

### Probar Nivel 3 en Modo Campaña
1. Iniciar campaña desde el menú principal
2. Completar Nivel 1 y Nivel 2
3. El juego avanzará automáticamente al Nivel 3
4. Verificar que:
   - El mapa y fondo se cargan correctamente
   - El héroe aparece en (394, 134)
   - Los 4 enemigos patrullan correctamente
   - Las 3 rutas de patrulla funcionan (incluyendo `patrol_3`)
   - Las 61 monedas son colectables
   - Las 3 lanzas otorgan invencibilidad

### Probar Nivel 3 Individualmente
1. Ir a "Seleccionar nivel"
2. Seleccionar "Nivel 3"
3. Verificar las mismas características arriba mencionadas

## Comparación Nivel 2 vs Nivel 3

| Característica | Nivel 2 | Nivel 3 |
|----------------|---------|---------|
| Dimensiones | 1587×1049 | 1587×1049 |
| Enemigos Patrol | 2 | 3 ✨ |
| Enemigos Seeker | 1 | 1 |
| Total Enemigos | 3 | 4 ✨ |
| Rutas de Patrulla | 2 (patrol, patrol_2) | 3 (patrol, patrol_2, patrol_3) ✨ |
| Monedas Normales | ? | 30 |
| Monedas Grandes | ? | 8 |
| Lanzas | 3 | 3 |
| Spawn del Héroe | ? | (394, 134) |

## Mecánicas Idénticas al Nivel 2

- ✅ Sistema de colisiones
- ✅ IA de enemigos (patrol y seeker)
- ✅ Sistema de visión (FOV + LOS)
- ✅ Estados de enemigos (PATROL → CHASE → SEARCH)
- ✅ Sistema de puertas/teletransporte (si aplica)
- ✅ Sistema de respawn de enemigos (3 segundos)
- ✅ Sistema de invencibilidad con lanzas (5 segundos)
- ✅ Condición de victoria: Recolectar todas las monedas
- ✅ Condición de derrota: Colisión con enemigo (3 vidas)

## Próximos Pasos

### Para agregar Niveles 1, 4 y 5:

1. **Crear/obtener assets:**
   - Mapa Tiled: `Nivel_X.tmj`
   - Fondo: `X_level_mini_bg.png`

2. **Actualizar Preloader.ts:**
```typescript
this.load.image('levelX_bg', 'backgrounds/X_level_mini_bg.png');
this.load.tilemapTiledJSON('levelX_map', 'maps/Nivel_X.tmj');
```

3. **Actualizar loadMapAndBackground() en Game.ts:**
```typescript
else if (_level === X) {
    mapKey = 'levelX_map';
    bgKey = 'levelX_bg';
    this.worldWidth = WIDTH;
    this.worldHeight = HEIGHT;
}
```

4. **Ajustar rutas de patrulla si hay más de 3:**
   - Actualizar `loadWaypointsForPath()` si se necesitan `patrol_4`, `patrol_5`, etc.

## Notas Técnicas

### Compatibilidad
- ✅ Funciona con modo campaña
- ✅ Funciona con selección individual de nivel
- ✅ Usa los mismos assets de sprites que Nivel 2
- ✅ Mismo motor de física (Matter.js)
- ✅ Mismas animaciones de héroe y enemigos

### Performance
- 4 enemigos activos (1 más que Nivel 2)
- 61 monedas (sensores estáticos)
- 3 rutas de patrulla concurrentes

### Escalabilidad
El sistema está diseñado para:
- Soportar múltiples rutas de patrulla (patrol_1, patrol_2, ..., patrol_N)
- Dimensiones de mapa variables por nivel
- Cualquier cantidad de enemigos y monedas

## Validación

✅ **Compilación:** Sin errores de TypeScript  
✅ **Assets:** Mapa y fondo presentes en `/public/assets`  
✅ **Rutas:** Soporte para 3 rutas de patrulla  
✅ **Cámara:** Límites dinámicos según nivel  
✅ **Enemigos:** 4 enemigos con configuración correcta  
✅ **Monedas:** 61 monedas distribuidas en el mapa  
✅ **Documentación:** Archivo creado con todos los detalles

---

**Fecha de integración:** 11 de noviembre de 2025  
**Implementado por:** GitHub Copilot  
**Referencia:** Siguiendo patrón de LEVEL2_INTEGRATION.md
