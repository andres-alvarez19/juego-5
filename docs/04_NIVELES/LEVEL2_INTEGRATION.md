# Integración de Nivel 2 con Frontend Vue

## Resumen

El Nivel 2 del juego "Daring Dungeon Delver" ha sido completamente integrado con el frontend de Vue, siguiendo un flujo de juego sin menú interno de Phaser.

## Flujo de Juego

### 🎮 Modo Campaña
1. Usuario selecciona "Jugar campaña" en el menú de Vue
2. El juego inicia desde el Nivel 1
3. Al completar cada nivel (recolectar todas las monedas), avanza automáticamente al siguiente
4. Continúa hasta completar el Nivel 5
5. Al terminar la campaña o morir, regresa al menú de Vue

### 🎯 Modo Selección de Nivel
1. Usuario selecciona "Seleccionar nivel" en el menú de Vue
2. Selecciona un nivel específico (1-5)
3. Juega solo ese nivel
4. Al completar el nivel o morir, regresa al menú de Vue

## Arquitectura

### Store de Estado (`gameStore.ts`)
```typescript
- mode: 'campaign' | 'single-level'
- currentLevel: número del nivel actual
- isPlaying: si el juego está activo
```

**Métodos:**
- `startCampaign()`: Inicia campaña desde nivel 1
- `startLevel(level)`: Inicia un nivel específico
- `completeLevel()`: Maneja la completación de nivel
- `endGame()`: Finaliza el juego

### Comunicación Vue ↔ Phaser

**Vue → Phaser:**
```typescript
// En GameView.vue al inicializar
gameInstance.registry.set('gameMode', gameStore.mode);
gameInstance.registry.set('startLevel', gameStore.currentLevel);
```

**Phaser → Vue:**
```typescript
// En Game.ts
this.game.events.emit('level-complete', { score, level });
this.game.events.emit('game-over', { score, level });
```

## Escenas de Phaser

### Secuencia de Escenas
```
Boot → Preloader → Game
```

**Nota:** MainMenu fue eliminado, el juego inicia directamente en Game

### Game.ts - Funcionalidades Clave

#### Carga de Nivel
```typescript
create() {
  this.gameMode = this.registry.get('gameMode');
  this.currentLevel = this.registry.get('startLevel');
  this.loadLevel(this.currentLevel);
}
```

#### Condición de Victoria
```typescript
checkLevelComplete() {
  // Nivel completo cuando todas las monedas se recolectan
  if (this.coins.length === 0 && this.bigCoins.length === 0) {
    this.handleLevelComplete();
  }
}
```

#### Condición de Derrota
```typescript
isHeroEnemyCollision(bodyA, bodyB) {
  // Detecta colisión entre héroe y enemigo
  // Llama a handlePlayerDeath()
}
```

## Sistema de Niveles

### Nivel 2 (Implementado)
- **Mapa:** `Nivel_2.tmj` (1587×1049px)
- **Fondo:** `2_level_mini_bg.png`
- **Enemigos:** 3 Orcos con IA (patrol y seeker)
- **Objetivo:** Recolectar todas las monedas (normales y grandes)
- **Peligros:** Enemigos patrullando, puertas de teletransporte

### Niveles 1, 3, 4, 5 (Por Implementar)
Para agregar nuevos niveles:

1. **Crear assets:**
   - Mapa Tiled: `public/assets/maps/Nivel_X.tmj`
   - Fondo: `public/assets/backgrounds/X_level_mini_bg.png`

2. **Cargar en Preloader.ts:**
```typescript
this.load.image('levelX_bg', 'backgrounds/X_level_mini_bg.png');
this.load.tilemapTiledJSON('levelX_map', 'maps/Nivel_X.tmj');
```

3. **Actualizar loadMapAndBackground en Game.ts:**
```typescript
loadMapAndBackground(_level: number = 2) {
  let mapKey = 'level2_map';
  let bgKey = 'level2_bg';
  let worldWidth = 1587;
  let worldHeight = 1049;
  
  if (_level === 1) {
    mapKey = 'level1_map';
    bgKey = 'level1_bg';
    worldWidth = 1024; // ajustar según mapa
    worldHeight = 768;
  }
  // ... más niveles
}
```

## Eventos y API

### Eventos Emitidos por Phaser

**level-complete:**
```typescript
{
  score: number,  // Puntaje acumulado
  level: number   // Nivel completado
}
```

**game-over:**
```typescript
{
  score: number,  // Puntaje final
  level: number   // Nivel donde murió
}
```

### Manejo en Vue (GameView.vue)

```typescript
handleLevelComplete(data) {
  // Reportar puntaje al backend
  await gameLabClient.reportScore(...);
  
  // Verificar si hay siguiente nivel
  const hasNext = gameStore.completeLevel();
  
  if (hasNext) {
    // Continuar a siguiente nivel (campaña)
    gameInstance.registry.set('startLevel', gameStore.currentLevel);
  } else {
    // Terminar y volver al menú
    await endGameSession();
    returnToMenu();
  }
}
```

## Configuración de Phaser

### Physics Engine: Matter.js
```typescript
physics: {
  default: 'matter',
  matter: {
    gravity: { x: 0, y: 0 },
    debug: false,
  },
}
```

### Scale Mode
```typescript
scale: {
  mode: Phaser.Scale.FIT,
  autoCenter: Phaser.Scale.CENTER_BOTH,
}
```

## Mecánicas del Nivel 2

### Sistema de Monedas
- **Monedas normales:** +10 puntos
- **Monedas grandes:** +50 puntos
- **Total:** 62 monedas (suma variable según mapa)

### Sistema de Enemigos

#### Tipo "Patrol"
- Patrulla por waypoints definidos en el mapa
- Estados: PATROL → CHASE → SEARCH
- Radio de detección: 200px
- FOV: 90 grados
- Línea de visión (LOS) con raycast

#### Tipo "Seeker"
- Persigue al héroe constantemente
- Usa pathfinding simplificado
- Puede usar puertas

### Sistema de Puertas
- Teletransporta héroe y enemigos
- Propiedades: `doorId` y `targetId`
- Anula velocidad al teletransportarse

### Sistema de Lanzas
- Sensores estáticos en el mapa
- Eliminan enemigos al contacto
- Otorgan +100 puntos por enemigo

## Rutas de Vue Router

```typescript
/ddd                  → MenuView (menú principal)
/ddd/level-selector   → LevelSelectorView (selección de nivel)
/ddd/play            → GameView (juego Phaser)
/ddd/scores          → ScoresView (tabla de puntajes)
```

## Testing

### Probar Modo Campaña
1. Navegar a `/ddd`
2. Click en "Jugar campaña"
3. Completar nivel recolectando todas las monedas
4. Verificar que avance automáticamente

### Probar Modo Nivel Individual
1. Navegar a `/ddd`
2. Click en "Seleccionar nivel"
3. Seleccionar Nivel 2
4. Completar nivel
5. Verificar que regrese al menú

### Probar Game Over
1. Iniciar cualquier modo
2. Tocar un enemigo (Orco)
3. Verificar que regrese al menú

## Pendientes

### Funcionalidades por Implementar
- [ ] Niveles 1, 3, 4, 5
- [ ] Pathfinding A* completo para enemigos "seeker"
- [ ] UI en juego (HUD con oro, puntaje, vidas)
- [ ] Sistema de vidas (múltiples intentos)
- [ ] Efectos de sonido y música
- [ ] Efectos visuales (partículas, transiciones)
- [ ] Pantalla de pausa
- [ ] Tutorial en nivel 1

### Mejoras Sugeridas
- [ ] Animaciones de transición entre niveles
- [ ] Feedback visual al recolectar monedas
- [ ] Mini-mapa
- [ ] Sistema de power-ups
- [ ] Diferentes tipos de enemigos
- [ ] Boss final en nivel 5

## Notas Técnicas

### Cambios en Configuración
- Physics engine cambió de Arcade a Matter.js
- MainMenu scene removida del flujo
- Escala adaptativa agregada (FIT mode)

### Performance
- Enemigos: máximo 3 por nivel (Nivel 2)
- Monedas: 62 objetos estáticos con sensores
- Colisiones optimizadas con labels

### Compatibilidad
- Phaser 3.80+
- Vue 3.x
- TypeScript 5.x
- Matter.js (incluido en Phaser)
