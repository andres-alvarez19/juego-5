import type { GameLike, Enemy } from './types';
import { EnemyState } from './types';

export function updateEnemiesAI(scene: GameLike, delta: number) {
    scene.enemies.forEach(enemy => {
        if (enemy.isDead) {
            return;
        }

        if (enemy.sprite.getData('frozen')) {
            enemy.sprite.setVelocity(0, 0);

            const isAttacking = enemy.sprite.getData('attacking');
            const targetAnim = isAttacking ? 'orc_attack_anim' : 'orc_idle_anim';

            if (!enemy.sprite.anims.isPlaying || enemy.sprite.anims.currentAnim?.key !== targetAnim) {
                enemy.sprite.play(targetAnim, true);
            }
            return;
        }

        if (enemy.type === 'patrol') {
            updatePatrolEnemy(scene, enemy);
        } else if (enemy.type === 'seeker') {
            updateSeekerEnemy(scene, enemy);
        }
    });
}

function updatePatrolEnemy(scene: GameLike, enemy: Enemy) {
    if (!enemy.waypoints || enemy.waypoints.length === 0) {
        enemy.sprite.setVelocity(0, 0);
        enemy.sprite.play('orc_idle_anim', true);
        return;
    }

    const heroVisible = canSeeHero(scene, enemy);

    switch (enemy.state) {
        case EnemyState.PATROL:
            if (heroVisible) {
                enemy.state = EnemyState.CHASE;
                enemy.lastSeenX = scene.hero.x;
                enemy.lastSeenY = scene.hero.y;
            } else {
                moveToWaypoint(scene, enemy);
            }
            break;

        case EnemyState.CHASE:
            if (heroVisible) {
                enemy.lastSeenX = scene.hero.x;
                enemy.lastSeenY = scene.hero.y;
                moveTowardsTarget(scene, enemy, scene.hero.x, scene.hero.y);
            } else {
                const dist = Phaser.Math.Distance.Between(
                    enemy.sprite.x,
                    enemy.sprite.y,
                    scene.hero.x,
                    scene.hero.y
                );
                if (dist > enemy.loseRadius) enemy.state = EnemyState.SEARCH;
            }
            break;

        case EnemyState.SEARCH:
            if (heroVisible) {
                enemy.state = EnemyState.CHASE;
                enemy.lastSeenX = scene.hero.x;
                enemy.lastSeenY = scene.hero.y;
            } else if (enemy.lastSeenX !== undefined && enemy.lastSeenY !== undefined) {
                const dist = Phaser.Math.Distance.Between(
                    enemy.sprite.x,
                    enemy.sprite.y,
                    enemy.lastSeenX,
                    enemy.lastSeenY
                );
                if (dist < 20) {
                    enemy.state = EnemyState.PATROL;
                    findNearestWaypoint(scene, enemy);
                } else {
                    moveTowardsTarget(scene, enemy, enemy.lastSeenX, enemy.lastSeenY);
                }
            }
            break;
    }
}

function updateSeekerEnemy(scene: GameLike, enemy: Enemy) {
    moveTowardsTarget(scene, enemy, scene.hero.x, scene.hero.y);
}

function canSeeHero(scene: GameLike, enemy: Enemy): boolean {
    const dx = scene.hero.x - enemy.sprite.x;
    const dy = scene.hero.y - enemy.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > enemy.chaseRadius) return false;

    const angleToHero = Math.atan2(dy, dx) * (180 / Math.PI);
    const enemyAngle = enemy.sprite.getData('facingAngle') || 0;
    const angleDiff = Math.abs(angleToHero - enemyAngle);

    if (angleDiff > enemy.fov / 2 && angleDiff < 360 - enemy.fov / 2) return false;

    return hasLineOfSight(scene, enemy.sprite.x, enemy.sprite.y, scene.hero.x, scene.hero.y);
}

function hasLineOfSight(scene: GameLike, x1: number, y1: number, x2: number, y2: number): boolean {
    const bodies = scene.matter.world.getAllBodies().filter((b: any) => b.label === 'wall');
    const line = new Phaser.Geom.Line(x1, y1, x2, y2);

    for (const body of bodies) {
        const bounds = body.bounds;
        const rect = new Phaser.Geom.Rectangle(
            bounds.min.x,
            bounds.min.y,
            bounds.max.x - bounds.min.x,
            bounds.max.y - bounds.min.y
        );

        if (Phaser.Geom.Intersects.LineToRectangle(line, rect)) {
            return false;
        }
    }

    return true;
}

function moveToWaypoint(scene: GameLike, enemy: Enemy) {
    if (!enemy.waypoints || enemy.waypoints.length === 0) {
        enemy.sprite.setVelocity(0, 0);
        enemy.sprite.play('orc_idle_anim', true);
        return;
    }

    if (enemy.currentWaypointIndex < 0) {
        enemy.currentWaypointIndex = 0;
        enemy.waypointDirection = 1;
    } else if (enemy.currentWaypointIndex >= enemy.waypoints.length) {
        enemy.currentWaypointIndex = enemy.waypoints.length - 1;
        enemy.waypointDirection = -1;
    }

    const waypoint = enemy.waypoints[enemy.currentWaypointIndex];
    if (!waypoint) {
        console.error(
            `[Waypoint Error] Invalid waypoint at index ${enemy.currentWaypointIndex}`
        );
        return;
    }

    const dist = Phaser.Math.Distance.Between(
        enemy.sprite.x,
        enemy.sprite.y,
        waypoint.x,
        waypoint.y
    );

    const threshold = 50;

    if (dist < threshold) {
        let nextIndex = enemy.currentWaypointIndex + enemy.waypointDirection;

        if (nextIndex >= enemy.waypoints.length) {
            enemy.waypointDirection = -1;
            nextIndex = enemy.currentWaypointIndex - 1;
        } else if (nextIndex < 0) {
            enemy.waypointDirection = 1;
            nextIndex = enemy.currentWaypointIndex + 1;
        }

        enemy.currentWaypointIndex = nextIndex;
    } else {
        moveTowardsTarget(scene, enemy, waypoint.x, waypoint.y);
    }
}

function moveTowardsTarget(
    scene: GameLike,
    enemy: Enemy,
    targetX: number,
    targetY: number
) {
    const dx = targetX - enemy.sprite.x;
    const dy = targetY - enemy.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
        const velocityX = (dx / distance) * enemy.speed;
        const velocityY = (dy / distance) * enemy.speed;

        enemy.sprite.setVelocity(velocityX, velocityY);
        enemy.sprite.setAngle(0);
        enemy.sprite.play('orc_walk_anim', true);

        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        enemy.sprite.setData('facingAngle', angle);
        enemy.sprite.setFlipX(dx < 0);
    } else {
        enemy.sprite.setVelocity(0, 0);
        enemy.sprite.setAngle(0);
        enemy.sprite.play('orc_idle_anim', true);
    }
}

function findNearestWaypoint(scene: GameLike, enemy: Enemy) {
    if (!enemy.waypoints || enemy.waypoints.length === 0) return;

    let nearestIndex = 0;
    let nearestDist = Infinity;

    enemy.waypoints.forEach((waypoint, index) => {
        const dist = Phaser.Math.Distance.Between(
            enemy.sprite.x,
            enemy.sprite.y,
            waypoint.x,
            waypoint.y
        );
        if (dist < nearestDist) {
            nearestDist = dist;
            nearestIndex = index;
        }
    });

    enemy.currentWaypointIndex = nearestIndex;
}
