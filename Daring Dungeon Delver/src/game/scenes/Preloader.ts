import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  We loaded this image in our Boot Scene, so we can display it here

        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
        this.load.setPath('/assets');

        this.load.image('logo', 'logo.png');
        this.load.image('main_menu', 'backgrounds/main_menu.png');
        
        // Level 2 background and map
        this.load.image('level2_bg', 'backgrounds/2_level_mini_bg.png');
        this.load.tilemapTiledJSON('level2_map', 'maps/Nivel_2.tmj');
        
        // Level 3 background and map
        this.load.image('level3_bg', 'backgrounds/3_level_mini_bg.png');
        this.load.tilemapTiledJSON('level3_map', 'maps/nivel_3.tmj');
        
        // Level 4 background and map
        this.load.image('level4_bg', 'backgrounds/4_level_mini_bg.png');
        this.load.tilemapTiledJSON('level4_map', 'maps/nivel_4.tmj');
        
        // Level 5 background and map
        this.load.image('level5_bg', 'backgrounds/5_level_mini_bg.png');
        this.load.tilemapTiledJSON('level5_map', 'maps/nivel_5.tmj');
        
        // Adler walk spritesheet (shared with level 1)
        this.load.spritesheet('player_walk', 'alder-walk.png', {
            frameWidth: 100,
            frameHeight: 100
        });

        // Enemy sprites - atlas unificado y normalizado generado por herramienta
        this.load.atlas('orc', 'atlas/orc.png', 'atlas/orc.json');
        
        // Rewards
        this.load.image('coin', 'entities/rewards/normal coin.png');
        this.load.image('big_coin', 'entities/rewards/big coin.png');
        
        // Weapons
        this.load.image('spear', 'entities/weapons/spear.png');
    }

    create ()
    {
        //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
        //  For example, you can define global animations here, so we can use them in other scenes.

        //  Move directly to the Game scene
        //  The level to load will be determined by the registry values set from Vue
        this.scene.start('Game');
    }
}
