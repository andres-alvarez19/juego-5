import type { GameLike, Enemy } from '../logic/types';
import { emitUIUpdate } from '../logic/level';

export function setupCollisions(scene: GameLike, enemies: Enemy[]) {
    const processPairs = (event: any) => {
        event.pairs.forEach((pair: any) => {
            const { bodyA, bodyB } = pair;
            if (isCoinCollision(bodyA, bodyB)) collectCoin(scene, bodyA, bodyB);
            if (isSpearHeroCollision(bodyA, bodyB)) collectSpear(scene, bodyA, bodyB);
            if (isDoorCollision(scene, bodyA, bodyB)) handleDoorTeleport(scene, bodyA, bodyB);
            if (isSpearEnemyCollision(scene, bodyA, bodyB)) handleSpearEnemyCollision(scene, bodyA, bodyB, enemies);
            if (isHeroEnemyCollision(scene, bodyA, bodyB, enemies)) handleHeroEnemyCollision(scene, bodyA, bodyB, enemies);
        });
    };

    scene.matter.world.on('collisionstart', processPairs);
    scene.matter.world.on('collisionactive', processPairs);
}

function isCoinCollision(bodyA: any, bodyB: any): boolean {
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;

    if (!spriteA || !spriteB) return false;

    return (
        (spriteA.getData('type') === 'hero' && (spriteB.getData('type') === 'coin' || spriteB.getData('type') === 'big_coin')) ||
        (spriteB.getData('type') === 'hero' && (spriteA.getData('type') === 'coin' || spriteA.getData('type') === 'big_coin'))
    );
}

function collectCoin(scene: GameLike, bodyA: any, bodyB: any) {
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;

    const coin = spriteA.getData('type') === 'coin' || spriteA.getData('type') === 'big_coin' ? spriteA : spriteB;
    const value = coin.getData('value') || 10;

    scene.goldCollected += value;
    scene.score += value;
    coin.destroy();

    scene.coins = scene.coins.filter(c => c !== coin);
    scene.bigCoins = scene.bigCoins.filter(c => c !== coin);

    emitUIUpdate(scene);
}

function isDoorCollision(scene: GameLike, bodyA: any, bodyB: any): boolean {
    return (
        (bodyA.label === 'door' && bodyB.gameObject?.getData('type') === 'hero') ||
        (bodyB.label === 'door' && bodyA.gameObject?.getData('type') === 'hero') ||
        (bodyA.label === 'door' && bodyB.gameObject?.getData('type') === 'enemy') ||
        (bodyB.label === 'door' && bodyA.gameObject?.getData('type') === 'enemy')
    );
}

function handleDoorTeleport(scene: GameLike, bodyA: any, bodyB: any) {
    const currentTime = scene.time.now;
    const sceneAny = scene as any;
    if (currentTime - sceneAny.lastTeleportTime < 500) return;

    const doorBody = bodyA.label === 'door' ? bodyA : bodyB;
    const entityBody = bodyA.label === 'door' ? bodyB : bodyA;
    const entity = entityBody.gameObject as Phaser.Physics.Matter.Sprite;
    if (!entity) return;
    const door = sceneAny.doors.find((d: any) => d.body === doorBody);
    if (!door) return;
    const targetDoor = sceneAny.doors.find((d: any) => d.id === door.targetId);
    if (!targetDoor) return;

    entity.setPosition(targetDoor.x, targetDoor.y);
    entity.setVelocity(0, 0);
    sceneAny.lastTeleportTime = currentTime;
}

function isSpearHeroCollision(bodyA: any, bodyB: any): boolean {
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;
    if (!spriteA || !spriteB) return false;
    return (
        (spriteA.getData('type') === 'spear' && spriteB.getData('type') === 'hero') ||
        (spriteB.getData('type') === 'spear' && spriteA.getData('type') === 'hero')
    );
}

function collectSpear(scene: GameLike, bodyA: any, bodyB: any) {
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;

    const spear = spriteA.getData('type') === 'spear' ? spriteA : spriteB;

    if (spear.getData('pickedUp')) return;

    spear.setData('pickedUp', true);
    spear.setVisible(false);

    scene.isInvincible = true;
    scene.invincibilityEndTime = scene.time.now + 5000;
    scene.hero.setTint(0x00ff00);
}

function isSpearEnemyCollision(scene: GameLike, bodyA: any, bodyB: any): boolean {
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;
    if (!spriteA || !spriteB) return false;

    const spear = spriteA.getData('type') === 'spear'
        ? spriteA
        : spriteB.getData('type') === 'spear'
        ? spriteB
        : null;

    if (!spear || !spear.getData('pickedUp')) return false;

    return (
        (spriteA.getData('type') === 'spear' && spriteB.getData('type') === 'enemy') ||
        (spriteB.getData('type') === 'spear' && spriteA.getData('type') === 'enemy')
    );
}

function handleSpearEnemyCollision(scene: GameLike, bodyA: any, bodyB: any, enemies: Enemy[]) {
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;
    const enemy = spriteA.getData('type') === 'enemy' ? spriteA : spriteB;

    const enemyData = enemies.find(e => e.sprite === enemy);
    if (enemyData?.isDead) {
        return;
    }

    if (enemyData) {
        killEnemy(scene, enemyData);
    }
}

function isHeroEnemyCollision(scene: GameLike, bodyA: any, bodyB: any, enemies: Enemy[]): boolean {
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;
    if (!spriteA || !spriteB) return false;
    const isEnemyA = spriteA.getData('type') === 'enemy';
    const isEnemyB = spriteB.getData('type') === 'enemy';
    let enemySprite: Phaser.Physics.Matter.Sprite | null = null;
    if (isEnemyA) enemySprite = spriteA;
    if (isEnemyB) enemySprite = spriteB;
    if (enemySprite) {
        const enemyData = enemies.find(e => e.sprite === enemySprite);
        if (enemyData?.isDead || enemySprite.getData('frozen') || enemySprite.getData('attacking')) return false;
    }
    return (
        (spriteA.getData('type') === 'hero' && isEnemyB) ||
        (spriteB.getData('type') === 'hero' && isEnemyA)
    );
}

function handleHeroEnemyCollision(scene: GameLike, bodyA: any, bodyB: any, enemies: Enemy[]) {
    const sceneAny = scene as any;
    const now = scene.time.now;
    const spriteA = bodyA.gameObject as Phaser.Physics.Matter.Sprite;
    const spriteB = bodyB.gameObject as Phaser.Physics.Matter.Sprite;
    const enemy = spriteA.getData('type') === 'enemy' ? spriteA : spriteB;
    const enemyData = enemies.find(e => e.sprite === enemy);
    if (enemyData?.isDead) {
        return;
    }

    // Si el héroe tiene la lanza, cualquier contacto con el goblin lo mata
    if (scene.isInvincible && enemyData) {
        killEnemy(scene, enemyData);
        return;
    }

    // Invulnerable por daño reciente
    if (now < scene.damageInvulnerableUntil) {
        return;
    }

    // Aplicar daño al héroe
    scene.damageInvulnerableUntil = now + 2000;
    enemy.setVelocity(0, 0);
    if (enemyData) {
        enemyData.sprite.setData('frozen', true);
        enemyData.sprite.setData('attacking', true);
        enemyData.sprite.setVisible(true);
        enemyData.sprite.setActive(true);
        enemyData.sprite.setStatic(true);
    }
    enemy.play('orc_attack_anim', true);
    scene.hero.setTint(0xff0000);
    scene.lives--;
    emitUIUpdate(scene);

    if (scene.lives <= 0) {
        if (enemyData) {
            enemyData.sprite.setData('frozen', false);
            enemyData.sprite.setData('attacking', false);
            enemyData.sprite.setVisible(true);
            enemyData.sprite.setStatic(false);
        }
        sceneAny.handlePlayerDeath();
    } else {
        // Pasados 2 segundos, el héroe puede volver a recibir daño
        scene.time.delayedCall(2000, () => {
            if (enemyData) {
                enemyData.sprite.setData('frozen', false);
                enemyData.sprite.setData('attacking', false);
                enemyData.sprite.setVisible(true);
                enemyData.sprite.setStatic(false);
            }
            scene.hero.clearTint();
        });
    }
}

export function killEnemy(scene: GameLike, enemy: Enemy) {
    enemy.isDead = true;

    enemy.sprite.setVelocity(0, 0);
    enemy.sprite.setAngularVelocity(0);
    enemy.sprite.setStatic(true);

    enemy.sprite.anims.stop();
    enemy.sprite.play('orc_death_anim', true);

    enemy.sprite.once('animationcomplete', () => {
        enemy.sprite.setVisible(false);
        enemy.sprite.setActive(false);
        enemy.sprite.setVelocity(0, 0);

        scene.time.delayedCall(3000, () => {
            respawnEnemy(scene, enemy);
        });
    });

    scene.score += 100;
    emitUIUpdate(scene);
}

export function respawnEnemy(scene: GameLike, enemy: Enemy) {
    enemy.isDead = false;

    enemy.sprite.setStatic(false);
    enemy.sprite.setPosition(enemy.originalX, enemy.originalY);
    enemy.sprite.setVelocity(0, 0);
    enemy.sprite.setAngularVelocity(0);

    enemy.sprite.clearTint();
    enemy.sprite.setData('frozen', false);
    enemy.sprite.setData('attacking', false);

    enemy.state = enemy.type === 'seeker' ? scene.registry.get('EnemyState')?.CHASE || 0 : scene.registry.get('EnemyState')?.PATROL || 0;
    enemy.lastSeenX = undefined;
    enemy.lastSeenY = undefined;
    enemy.lastReplanTime = 0;

    if (enemy.type === 'patrol' && enemy.waypoints && enemy.waypoints.length > 0) {
        enemy.currentWaypointIndex = 0;
        enemy.waypointDirection = 1;
    }

    enemy.sprite.setVisible(true);
    enemy.sprite.setActive(true);
    enemy.sprite.setScale(2.5);
    enemy.sprite.setOrigin(0.5, 1);
    enemy.sprite.anims.stop();
    enemy.sprite.play('orc_idle_anim', true);
}
