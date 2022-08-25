import * as phaser from 'phaser';
import { AssetKeys } from '../assets';
import { ConfigProvider } from '../game-config/config-provider';
import { GridCoords } from './grid/grid-coords';

export class Player extends phaser.Physics.Arcade.Image {
    constructor(scene: phaser.Scene, assetKey: AssetKeys, colorHex: string, gridX = 0, gridY = 0) {
        const { playerSize } = ConfigProvider.getConfig();

        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1], assetKey);

        scene.physics.add.existing(this);
        scene.physics.systems.displayList.add(this);

        this.setDisplaySize(playerSize, playerSize);
        this.setCollideWorldBounds(true);
        this.setTint(Number.parseInt(colorHex, 16));
    }

    getGridPos(): [number, number] {
        return GridCoords.getGridPosFromCoords(this.x, this.y);
    }

    moveToGridCell(gridX: number, gridY: number, animate = true) {
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        if (animate) {
            this.scene.tweens.add({
                targets: this,
                x: coords[0],
                y: coords[1],
                duration: 300,
            });
        } else {
            this.setX(coords[0]);
            this.setY(coords[1]);
        }
    }
}
