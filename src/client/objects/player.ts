import * as phaser from 'phaser';
import { AssetKeys } from '../assets';
import { GlobalConfigProvider } from '../utils/global-config-provider';
import { GridCoords } from './grid/grid-coords';

export class Player extends phaser.Physics.Arcade.Image {
    constructor(scene: phaser.Scene, assetKey: AssetKeys, gridX: number, gridY: number) {
        const { playerSize } = GlobalConfigProvider.getConfig();

        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1], assetKey);

        scene.physics.add.existing(this);
        scene.physics.systems.displayList.add(this);

        this.setDisplaySize(playerSize, playerSize);
        this.setCollideWorldBounds(true);
    }

    getGridPos(): [number, number] {
        return GridCoords.getGridPosFromCoords(this.x, this.y);
    }

    moveToGridCell(gridX: number, gridY: number) {
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        this.scene.tweens.add({
            targets: this,
            x: coords[0],
            y: coords[1],
            duration: 300,
        });
    }
}
