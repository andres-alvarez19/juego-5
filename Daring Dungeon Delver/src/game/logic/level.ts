import type { GameLike } from './types';

export function loadLevel(scene: GameLike, level: number) {
    console.log('[Game Scene] Loading level:', level);

    cleanupLevel(scene);

    scene.goldCollected = 0;
    scene.levelComplete = false;
    scene.lives = 3;

    emitUIUpdate(scene);
    loadMapAndBackground(scene, level);
    buildStaticCollidersFromLayer(scene, 'colliders');
    setupDoorsFromLayer(scene, 'door');
}

export function cleanupLevel(scene: GameLike) {
    scene.enemies.forEach(e => e.sprite.destroy());
    scene.coins.forEach(c => c.destroy());
    scene.bigCoins.forEach(c => c.destroy());
    scene.spears.forEach(s => s.destroy());

    scene.enemies = [];
    scene.coins = [];
    scene.bigCoins = [];
    scene.spears = [];
    scene.doors = [];

    if (scene.tilemap) {
        scene.tilemap.destroy();
    }

    if (scene.background) {
        scene.background.destroy();
    }
}

export function loadMapAndBackground(scene: GameLike, _level: number = 2) {
    let mapKey: string;
    let bgKey: string;

    const level = Number(_level);
    console.log('[Game Scene] loadMapAndBackground called with level:', level, 'type:', typeof level);

    if (level === 1) {
        console.warn('[Game Scene] Level 1 not implemented yet. Loading Level 2 instead.');
        mapKey = 'level2_map';
        bgKey = 'level2_bg';
        scene.worldWidth = 1587;
        scene.worldHeight = 1049;
    } else if (level === 2) {
        console.log('[Game Scene] Loading Level 2 assets');
        mapKey = 'level2_map';
        bgKey = 'level2_bg';
        scene.worldWidth = 1587;
        scene.worldHeight = 1049;
    } else if (level === 3) {
        console.log('[Game Scene] Loading Level 3 assets');
        mapKey = 'level3_map';
        bgKey = 'level3_bg';
        scene.worldWidth = 1587;
        scene.worldHeight = 1049;
    } else if (level === 4) {
        console.log('[Game Scene] ✨✨✨ LOADING LEVEL 4 ASSETS ✨✨✨');
        mapKey = 'level4_map';
        bgKey = 'level4_bg';
        scene.worldWidth = 1587;
        scene.worldHeight = 1049;
    } else if (level === 5) {
        console.log('[Game Scene] 🎉 LOADING LEVEL 5 ASSETS 🎉');
        mapKey = 'level5_map';
        bgKey = 'level5_bg';
        scene.worldWidth = 1587;
        scene.worldHeight = 1049;
    } else {
        console.warn(`[Game Scene] Level ${level} not implemented yet. Loading Level 2 instead.`);
        mapKey = 'level2_map';
        bgKey = 'level2_bg';
        scene.worldWidth = 1587;
        scene.worldHeight = 1049;
    }

    console.log(`[Game Scene] Using mapKey: ${mapKey}, bgKey: ${bgKey}`);

    scene.tilemap = scene.make.tilemap({ key: mapKey });
    scene.background = scene.add.image(0, 0, bgKey);
    scene.background.setOrigin(0, 0);

    scene.matter.world.setBounds(0, 0, scene.worldWidth, scene.worldHeight);
}

export function emitUIUpdate(scene: GameLike) {
    scene.game.events.emit('score-update', scene.score);
    scene.game.events.emit('lives-update', scene.lives);
}

export function buildStaticCollidersFromLayer(scene: GameLike, layerName: string) {
    const debugGraphics = scene.add.graphics();
    debugGraphics.lineStyle(1, 0xff0000, 0.5);

    const colliderLayer = scene.tilemap.getObjectLayer(layerName);
    if (!colliderLayer) return;

    colliderLayer.objects.forEach((obj: any) => {
        if (obj.polygon && obj.polygon.length > 0) {
            const points = obj.polygon.map((p: any) => ({
                x: obj.x + p.x,
                y: obj.y + p.y
            }));

            let cx = 0;
            let cy = 0;
            points.forEach((p: any) => {
                cx += p.x;
                cy += p.y;
            });
            cx /= points.length;
            cy /= points.length;

            const relativePoints = points.map((p: any) => ({
                x: p.x - cx,
                y: p.y - cy
            }));

            // Debug: dibujar el polígono de colisión
            debugGraphics.beginPath();
            debugGraphics.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                debugGraphics.lineTo(points[i].x, points[i].y);
            }
            debugGraphics.closePath();
            debugGraphics.strokePath();

            scene.matter.add.fromVertices(cx, cy, relativePoints, {
                isStatic: true,
                label: 'wall'
            });
        } else if (obj.rectangle || (!obj.polygon && !obj.ellipse && !obj.polyline && obj.width && obj.height)) {
            const x = obj.x + obj.width / 2;
            const y = obj.y + obj.height / 2;

            // Debug: dibujar el rectángulo de colisión
            debugGraphics.strokeRect(obj.x, obj.y, obj.width, obj.height);

            scene.matter.add.rectangle(x, y, obj.width, obj.height, {
                isStatic: true,
                label: 'wall'
            });
        }
    });
}

export function setupDoorsFromLayer(scene: GameLike, layerName: string) {
    const doorLayer = scene.tilemap.getObjectLayer(layerName);
    if (!doorLayer) return;

    const debugGraphics = scene.add.graphics();
    debugGraphics.lineStyle(1, 0x00ffff, 0.7);

    doorLayer.objects.forEach((obj: any) => {
        const doorId = obj.properties?.find((p: any) => p.name === 'doorId')?.value;
        const targetId = obj.properties?.find((p: any) => p.name === 'targetId')?.value;

        if (doorId && targetId) {
            const x = obj.x + (obj.width || 0) / 2;
            const y = obj.y + (obj.height || 0) / 2;

             // Debug: dibujar el área de la puerta
             if (obj.width && obj.height) {
                 debugGraphics.strokeRect(obj.x, obj.y, obj.width, obj.height);
             }

            const body = scene.matter.add.rectangle(x, y, obj.width || 32, obj.height || 32, {
                isStatic: true,
                isSensor: true,
                label: 'door'
            });
            scene.doors.push({ id: doorId, targetId, body, x, y });
        }
    });
}
