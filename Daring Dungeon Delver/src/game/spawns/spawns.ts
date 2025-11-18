import type { GameLike, Enemy, Waypoint } from '../logic/types';
import { normalizeCharacterBody } from '../utils/physics';

export function spawnHeroFromLayer(scene: GameLike, layerName: string) {
    const heroLayer = scene.tilemap.getObjectLayer(layerName);
    if (!heroLayer) return;

    const spawnPoint = heroLayer.objects.find((obj: any) => {
        return obj.properties?.find((p: any) => p.name === 'spawn' && p.value === true);
    });

    if (spawnPoint) {
        const x = spawnPoint.x ?? 100;
        const y = spawnPoint.y ?? 100;
        scene.hero = scene.matter.add.sprite(x, y, 'player_walk', 0);
        scene.hero.setFriction(0.1);
        scene.hero.setBounce(0);
        scene.hero.setScale(1.4);
        scene.hero.setOrigin(0.5, 0.5);
        scene.hero.setData('type', 'hero');

        // Normalizar collider para evitar usar el área transparente del sprite
        normalizeCharacterBody(scene.hero, 20);
    }
}

export function spawnCoinsFromLayer(
    scene: GameLike,
    coinLayerName: string,
    bigCoinLayerName: string
) {
    const coinLayer = scene.tilemap.getObjectLayer(coinLayerName);
    if (coinLayer) {
        coinLayer.objects.forEach((obj: any) => {
            const x = obj.x + (obj.width || 0) / 2;
            const y = obj.y + (obj.height || 0) / 2;
            const coin = scene.matter.add.sprite(x, y, 'coin');
            coin.setCircle(8);
            coin.setSensor(true);
            coin.setStatic(true);
            coin.setData('type', 'coin');
            coin.setData('value', 10);
            coin.setScale(0.5);
            scene.coins.push(coin);
        });
    }

    const bigCoinLayer = scene.tilemap.getObjectLayer(bigCoinLayerName);
    if (bigCoinLayer) {
        bigCoinLayer.objects.forEach((obj: any) => {
            const x = obj.x + (obj.width || 0) / 2;
            const y = obj.y + (obj.height || 0) / 2;
            const bigCoin = scene.matter.add.sprite(x, y, 'big_coin');
            bigCoin.setCircle(12);
            bigCoin.setSensor(true);
            bigCoin.setStatic(true);
            bigCoin.setData('type', 'big_coin');
            bigCoin.setData('value', 50);
            bigCoin.setScale(0.7);
            scene.bigCoins.push(bigCoin);
        });
    }
}

export function spawnSpearsFromLayer(scene: GameLike, layerName: string) {
    const spearLayer = scene.tilemap.getObjectLayer(layerName);
    if (!spearLayer) return;

    spearLayer.objects.forEach((obj: any) => {
        const x = obj.x + (obj.width || 0) / 2;
        const y = obj.y + (obj.height || 0) / 2;
        const spear = scene.matter.add.sprite(x, y, 'spear');
        spear.setSensor(true);
        spear.setStatic(true);
        spear.setData('type', 'spear');
        spear.setData('pickedUp', false);
        spear.setScale(0.8);
        scene.spears.push(spear);
    });
}

export function spawnEnemiesFromLayer(
    scene: GameLike,
    layerName: string,
    options: { patrolLayers: string[] },
    EnemyStateEnum: any
) {
    const enemyLayer = scene.tilemap.getObjectLayer(layerName);
    if (!enemyLayer) return;

    enemyLayer.objects.forEach((obj: any) => {
        const type = obj.properties?.find((p: any) => p.name === 'type')?.value;
        const pathId = obj.properties?.find((p: any) => p.name === 'pathId')?.value;
        const chaseRadius = obj.properties?.find((p: any) => p.name === 'chaseRadius')?.value || 200;
        const loseRadius = obj.properties?.find((p: any) => p.name === 'loseRadius')?.value || 300;
        const fov = obj.properties?.find((p: any) => p.name === 'fov')?.value || 90;
        const reducedSpeed = 1;
        const speed = reducedSpeed;
        const replanMs = obj.properties?.find((p: any) => p.name === 'replanMs')?.value || 1000;

        const sprite = scene.matter.add.sprite(obj.x, obj.y, 'orc', 'orc_idle_0');
        sprite.setOrigin(0.5, 1);
        sprite.setFixedRotation();
        sprite.setFriction(0.1);
        sprite.setData('type', 'enemy');
        sprite.setScale(2.5);

        const bodyRadius = 16;
        sprite.setBody({
            type: 'circle',
            radius: bodyRadius
        });
        sprite.setFixedRotation();
        sprite.setAngle(0);

        const enemy: Enemy = {
            sprite,
            type: type || 'patrol',
            state: EnemyStateEnum.PATROL,
            pathId,
            waypoints: [],
            currentWaypointIndex: 0,
            waypointDirection: 1,
            chaseRadius,
            loseRadius,
            fov,
            speed,
            replanMs,
            lastReplanTime: 0,
            originalX: obj.x,
            originalY: obj.y,
            isDead: false
        };

        if (type === 'patrol' && pathId) {
            enemy.waypoints = loadWaypointsForPath(scene, pathId, options.patrolLayers);
        }

        scene.enemies.push(enemy);
    });
}

export function loadWaypointsForPath(
    scene: GameLike,
    pathId: string | number,
    _patrolLayers: string[]
): Waypoint[] {
    const waypoints: Waypoint[] = [];

    const pathIdNum = typeof pathId === 'string' ? parseInt(pathId) : pathId;
    let layerName = 'patrol';

    if (pathIdNum === 1) {
        layerName = 'patrol';
    } else if (pathIdNum === 2) {
        layerName = 'patrol_2';
    } else if (pathIdNum === 3) {
        layerName = 'patrol_3';
    } else if (pathIdNum === 4) {
        layerName = 'patrol_4';
    } else if (pathIdNum === 5) {
        layerName = 'patrol_5';
    } else if (pathIdNum === 6) {
        layerName = 'patrol_6';
    }

    const patrolLayer = scene.tilemap.getObjectLayer(layerName);

    if (!patrolLayer) {
        return waypoints;
    }

    patrolLayer.objects.forEach((obj: any) => {
        const order = obj.properties?.find((p: any) => p.name === 'pathId')?.value;

        if (order !== undefined) {
            waypoints.push({ x: obj.x, y: obj.y, order });
        }
    });

    waypoints.sort((a, b) => a.order - b.order);
    return waypoints;
}

export function setupCameraFollow(scene: GameLike, target: Phaser.Physics.Matter.Sprite) {
    scene.camera.setBounds(0, 0, scene.worldWidth, scene.worldHeight);
    scene.camera.startFollow(target, true, 0.1, 0.1);
}
