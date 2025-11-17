import type { GameLike } from './types';

export function updatePlayerMovement(scene: GameLike) {
    const speed = 3;
    let velocityX = 0;
    let velocityY = 0;

    const leftDown = scene.cursors.left.isDown;
    const rightDown = scene.cursors.right.isDown;
    const upDown = scene.cursors.up.isDown;
    const downDown = scene.cursors.down.isDown;

    // Movimiento en 8 direcciones (incluye diagonales)
    if (leftDown) velocityX -= 1;
    if (rightDown) velocityX += 1;
    if (upDown) velocityY -= 1;
    if (downDown) velocityY += 1;

    const length = Math.hypot(velocityX, velocityY);
    if (length > 0) {
        velocityX = (velocityX / length) * speed;
        velocityY = (velocityY / length) * speed;
    }

    scene.hero.setVelocity(velocityX, velocityY);

    let nextAnim: string | null = null;
    let flipX = false;

    const isMoving = velocityX !== 0 || velocityY !== 0;

    if (isMoving) {
        nextAnim = 'hero_walk_anim';
        if (velocityX < 0) {
            flipX = true;
        } else if (velocityX > 0) {
            flipX = false;
        }
    }

    if (isMoving) {
        if (nextAnim && scene.hero.anims.currentAnim?.key !== nextAnim) {
            scene.hero.play(nextAnim, true);
        }
    } else {
        scene.hero.anims.stop();
        scene.hero.setFrame(0);
    }

    scene.hero.setFlipX(flipX);
}
