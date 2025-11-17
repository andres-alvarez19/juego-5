# Menú de Pausa y Game Over - Daring Dungeon Delver

## Descripción

Sistema de interfaces de usuario que aparecen sobre el juego:

### Menú de Pausa
Aparece cuando el jugador presiona la tecla `ESC`. Permite al jugador:
- **Continuar**: Reanudar el juego
- **Reiniciar nivel**: Comenzar el nivel actual desde el principio
- **Volver al menú**: Regresar al menú principal

### Menú de Game Over
Aparece cuando el jugador pierde (muere en el juego). Muestra:
- Título "Game Over" en rojo
- Puntaje final obtenido
- **Reintentar**: Reinicia el nivel actual
- **Volver al menú**: Regresa al menú principal

## Componentes

### 1. `PauseMenu.vue`

Componente Vue que renderiza el menú de pausa con los siguientes elementos:
- Título "Pausa"
- Tres opciones interactivas con iconos:
  - Espada (`sword.png`) - Continuar
  - Reloj de arena (`hourglass.png`) - Reiniciar nivel
  - Puerta (`door.png`) - Volver al menú

**Props:**
- Ninguna

**Events:**
- `continue`: Se emite cuando el jugador selecciona "Continuar"
- `restart`: Se emite cuando el jugador selecciona "Reiniciar nivel"
- `returnToMenu`: Se emite cuando el jugador selecciona "Volver al menú"

**Métodos expuestos:**
- `show()`: Muestra el menú de pausa
- `hide()`: Oculta el menú de pausa
- `toggle()`: Alterna entre mostrar y ocultar

### 2. `GameOverMenu.vue`

Componente Vue que muestra la pantalla de Game Over con:

- Fondo semi-transparente oscuro con efecto blur (muestra el juego detrás)
- Título "Game Over" en color rojo (#dc2626)
- Puntaje final del jugador
- Dos botones:
  - Reintentar (con estilo de botón amarillo/verde)
  - Volver al menú

**Props:**
- Ninguna

**Events:**
- `retry`: Se emite cuando el jugador selecciona "Reintentar"
- `returnToMenu`: Se emite cuando el jugador selecciona "Volver al menú"

**Métodos expuestos:**
- `show(score: number)`: Muestra el menú de game over con el puntaje final
- `hide()`: Oculta el menú de game over

### 3. Integración en `GameView.vue`

El menú de pausa y game over están integrados en la vista del juego (`GameView.vue`).

**Eventos del navegador (Pausa):**
- `game-pause`: Se dispara cuando se muestra el menú (pausa el juego)
- `game-resume`: Se dispara cuando se oculta el menú (reanuda el juego)

**Eventos de Phaser (Game Over):**
**Eventos de Phaser (Game Over):**
- `game-over`: Se emite desde la escena de Phaser cuando el jugador muere

### 4. Integración en `Game.ts` (Phaser)

La escena del juego escucha la tecla `ESC` y dispara los eventos correspondientes:

```typescript
// En el método loadLevel()
this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
this.escapeKey.on('down', () => {
    this.togglePause();
});
```

La propiedad `isPaused` se usa en el método `update()` para detener el juego:

```typescript
update(_time: number, delta: number) {
    if (!this.hero || this.isPaused) return;
    // ... resto de la lógica
}
```

## Flujo de ejecución

### Menú de Pausa

1. El jugador presiona `ESC`
2. La escena de Phaser (`Game.ts`) detecta el evento y llama a `togglePause()`
3. Se dispara un evento personalizado `game-pause` o `game-resume`
4. `GameView.vue` escucha estos eventos y pausa/reanuda la escena de Phaser
5. El componente `PauseMenu.vue` muestra/oculta el menú según el evento
6. El jugador selecciona una opción:
   - **Continuar**: Cierra el menú y reanuda el juego
   - **Reiniciar**: Reinicia la escena actual
   - **Volver al menú**: Finaliza la sesión y vuelve al menú principal

### Menú de Game Over

1. El jugador muere (colisión con enemigo sin invencibilidad)
2. La escena de Phaser llama a `handlePlayerDeath()`
3. Se emite el evento `game-over` con el puntaje actual
4. `GameView.vue` detecta el evento y muestra el `GameOverMenu`
5. El componente `GameOverMenu.vue` muestra el puntaje final
6. El jugador selecciona una opción:
   - **Reintentar**: Reinicia la escena actual
   - **Volver al menú**: Finaliza la sesión y vuelve al menú principal

## Estilos

Ambos menús usan CSS Modules con las siguientes características:

**Comunes:**
- Posición fija que cubre toda la pantalla (z-index: 1000)
- Fondo oscuro semi-transparente (rgba(0, 0, 0, 0.7))
- Efecto blur (`backdrop-filter: blur(4px)`) que permite ver el juego detrás
- Sin imagen de fondo adicional - se ve el juego pausado
- Fuente "MedievalSharp" para mantener la estética del juego
- Diseño responsivo para pantallas móviles

**Menú de Pausa específico:**
- Panel central con borde y fondo semi-transparente
- Tres opciones con iconos
- Hover effects en las opciones (escala 1.05)

**Menú de Game Over específico:**
- Título "Game Over" grande en rojo (#dc2626)
- Puntaje final en amarillo (#f4d500)
- Botones con borde amarillo/verde (#a5aa00)
- Fondo de botones en tono azul oscuro (#183037)

## Assets necesarios

### Iconos (en `/public/assets/icons/`) - Solo para Menú de Pausa:
- `sword.png` - Icono de espada (Continuar)
- `hourglass.png` - Icono de reloj de arena (Reiniciar)
- `door.png` - Icono de puerta (Volver al menú)

**Nota:** El menú de Game Over no requiere assets adicionales, usa solo estilos CSS.

## Mejoras futuras

- Agregar sonidos al abrir/cerrar los menús
- Agregar animaciones de transición
- Implementar opciones de configuración en el menú de pausa (volumen, controles, etc.)
- Guardar el estado del juego cuando se pausa
- Mostrar estadísticas adicionales en Game Over (tiempo jugado, enemigos derrotados, etc.)
- Agregar efectos de partículas o animaciones al mostrar Game Over
