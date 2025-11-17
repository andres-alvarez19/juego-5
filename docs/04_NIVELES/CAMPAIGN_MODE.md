# Modo Campaña - Daring Dungeon Delver

## Descripción General

El juego ahora cuenta con dos modos de juego distintos:

### 1. Modo Campaña
- **Inicio**: El jugador comienza en el **Nivel 2**
- **Progresión**: El jugador avanza automáticamente al siguiente nivel cuando **recoge todas las monedas** del nivel actual
- **Secuencia**: Nivel 2 → Nivel 3 → Nivel 4 → Nivel 5
- **Finalización**: La campaña termina cuando se completa el Nivel 5 (último nivel)

### 2. Modo Nivel Específico
- **Inicio**: El jugador selecciona un nivel específico desde el selector de niveles
- **Objetivo**: Recoger todas las monedas del nivel seleccionado
- **Finalización**: El nivel se completa cuando se recogen todas las monedas, y el jugador regresa al menú principal

## Condición de Completado de Nivel

Para ambos modos, un nivel se considera **completado** cuando:
- ✅ El jugador **recoge todas las monedas normales** (coins)
- ✅ El jugador **recoge todas las monedas grandes** (big_coins)

## Flujo de Juego

### Modo Campaña

```
Menú Principal
    ↓
[Jugar Campaña]
    ↓
Nivel 2 → (recoger todas las monedas) → Nivel 3
    ↓
Nivel 3 → (recoger todas las monedas) → Nivel 4
    ↓
Nivel 4 → (recoger todas las monedas) → Nivel 5
    ↓
Nivel 5 → (recoger todas las monedas) → Campaña Completada
    ↓
Menú Principal
```

### Modo Nivel Específico

```
Menú Principal
    ↓
[Seleccionar Nivel]
    ↓
Selector de Niveles → Elegir Nivel (2, 3, 4, o 5)
    ↓
Nivel Seleccionado → (recoger todas las monedas) → Nivel Completado
    ↓
Menú Principal
```

## Implementación Técnica

### Archivos Modificados

1. **`gameStore.ts`**
   - Cambio: La campaña ahora empieza en el nivel 2 en lugar del nivel 1
   - Método: `startCampaign()` ahora establece `currentLevel = 2`

2. **`GameView.vue`**
   - Cambio: Cuando se completa un nivel en modo campaña, se reinicia la escena con el siguiente nivel
   - Método: `handleLevelComplete()` ahora reinicia la escena Game con el nuevo nivel

3. **`Game.ts`**
   - Cambio: Soporte para el nivel 5
   - Método: `loadMapAndBackground()` ahora carga correctamente los assets del nivel 5

4. **`Preloader.ts`**
   - Ya cargaba el nivel 5, no se requirieron cambios

### Lógica de Avance de Nivel

```typescript
// En gameStore.ts
completeLevel() {
  if (this.mode === 'campaign') {
    return this.nextLevel(); // Avanza al siguiente nivel
  } else {
    // Modo nivel específico - regresa al menú
    this.isPlaying = false;
    return false;
  }
}

// En GameView.vue
if (hasNextLevel) {
  // Modo campaña: reiniciar escena con el nuevo nivel
  gameInstance.registry.set('startLevel', gameStore.currentLevel);
  gameInstance.scene.stop('Game');
  gameInstance.scene.start('Game');
} else {
  // Nivel único completado o campaña terminada
  returnToMenu();
}
```

## Próximos Pasos (Nivel 1)

Para implementar el Nivel 1 y empezar la campaña desde ahí:

1. **Crear assets del Nivel 1**:
   - Mapa Tiled: `public/assets/maps/Nivel_1.tmj`
   - Background: `public/assets/backgrounds/1_level_mini_bg.png`

2. **Actualizar Preloader.ts**:
   ```typescript
   this.load.image('level1_bg', 'backgrounds/1_level_mini_bg.png');
   this.load.tilemapTiledJSON('level1_map', 'maps/Nivel_1.tmj');
   ```

3. **Actualizar Game.ts**:
   ```typescript
   if (level === 1) {
     console.log('[Game Scene] Loading Level 1 assets');
     mapKey = 'level1_map';
     bgKey = 'level1_bg';
     this.worldWidth = 1587;
     this.worldHeight = 1049;
   }
   ```

4. **Actualizar gameStore.ts**:
   ```typescript
   startCampaign() {
     this.mode = 'campaign';
     this.currentLevel = 1; // Cambiar de 2 a 1
     this.isPlaying = true;
   }
   ```

## Notas de Desarrollo

- El sistema está diseñado para ser extensible a más niveles
- Cada nivel debe tener sus propios assets (mapa .tmj y background)
- La condición de completado es consistente: recoger todas las monedas
- El modo campaña y el modo nivel específico comparten la misma lógica de juego, solo difieren en la progresión
