import * as phaser from 'phaser';
import { MainScene } from './scene/main';
import { GlobalConfigProvider } from './utils/global-config-provider';

import './styles/index.pcss';

GlobalConfigProvider.init({
    worldGridSize: [10, 10],
    groundBlockSize: 120,
    playerSize: 110,
});

const game = new phaser.Game({
    type: phaser.AUTO,
    width: '100%',
    height: '100%',
    backgroundColor: '#555555',
    scene: MainScene,
    input: {
        keyboard: false,
        mouse: true,
        touch: true,
    },
    fps: {
        target: 24,
    },
    physics: {
        default: 'arcade',
    },
});
