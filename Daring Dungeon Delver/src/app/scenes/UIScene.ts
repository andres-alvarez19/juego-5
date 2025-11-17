// src/scenes/UIScene.ts - NEW FILE

import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
    private score: number = 0;
    private scoreText!: Phaser.GameObjects.Text;

    constructor() {
        super({ key: 'UIScene' });
    }

    create() {
        // Create the score text object
        this.scoreText = this.add.text(16, 16, 'Score: 0', {
            fontSize: '32px',
            color: '#FFF'
        });

        // Get a reference to the Game Scene
        const gameScene = this.scene.get('GameScene');

        // Listen for the 'scoreChanged' event from the Game Scene
        gameScene.events.on('scoreChanged', (newScore: number) => {
            this.score = newScore;
            this.scoreText.setText('Score: ' + this.score);
        }, this);
    }
}
