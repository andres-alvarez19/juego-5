import type Phaser from 'phaser';

/**
 * Normaliza el collider de un sprite de personaje para evitar usar el
 * rectángulo completo con transparencia como colisión.
 * Usa un círculo centrado más pequeño que el sprite.
 */
export function normalizeCharacterBody(
    sprite: Phaser.Physics.Matter.Sprite,
    radius: number
) {
    sprite.setCircle(radius, {
        isStatic: false
    });
    sprite.setFixedRotation();
}

