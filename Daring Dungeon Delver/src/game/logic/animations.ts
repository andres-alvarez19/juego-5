import type { GameLike } from './types';

export function createAnimations(scene: GameLike) {
    if (!scene.anims.exists('hero_walk_anim')) {
        scene.anims.create({
            key: 'hero_walk_anim',
            frames: scene.anims.generateFrameNumbers('player_walk', {
                start: 0,
                end: 7
            }),
            frameRate: 10,
            repeat: -1
        });
    }

    // Animaciones del orco basadas en atlas unificado "orc"
    const createOrcAnim = (
        animKey: string,
        prefix: string,
        frameRate: number,
        repeat: number
    ) => {
        if (scene.anims.exists(animKey)) return;

        const texture = scene.textures.get('orc');
        if (!texture) return;

        const framesObj = (texture as any).frames as Record<string, unknown>;
        const indices = Object.keys(framesObj)
            .filter(name => name.startsWith(prefix))
            .map(name => parseInt(name.substring(prefix.length), 10))
            .filter(n => !Number.isNaN(n));

        if (!indices.length) return;

        const maxIndex = Math.max(...indices);
        scene.anims.create({
            key: animKey,
            frames: scene.anims.generateFrameNames('orc', {
                prefix,
                start: 0,
                end: maxIndex
            }),
            frameRate,
            repeat
        });
    };

    createOrcAnim('orc_idle_anim', 'orc_idle_', 2, -1);
    createOrcAnim('orc_walk_anim', 'orc_walk_', 3, -1);
    createOrcAnim('orc_attack_anim', 'orc_attack_', 10, 0);
    createOrcAnim('orc_death_anim', 'orc_death_', 8, 0);
    createOrcAnim('orc_hurt_anim', 'orc_hurt_', 8, 0);
}
