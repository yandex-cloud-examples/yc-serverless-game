import * as phaser from 'phaser';
import { AssetKeys } from '../assets';
import { GlobalConfigProvider } from '../utils/global-config-provider';
import { GridCoords } from './grid/grid-coords';

export class Ground extends phaser.GameObjects.Image {
    constructor(scene: phaser.Scene, assetKey: AssetKeys, gridX: number, gridY: number) {
        const { groundBlockSize } = GlobalConfigProvider.getConfig();
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1], assetKey);

        scene.add.existing(this);

        this.setDisplaySize(groundBlockSize, groundBlockSize);
    }

    getGridPos(): [number, number] {
        return GridCoords.getGridPosFromCoords(this.x, this.y);
    }
}
