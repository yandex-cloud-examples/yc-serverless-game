import * as phaser from 'phaser';
import { AssetKeys } from '../../assets';
import { ConfigProvider } from '../../game-config/config-provider';
import { GridCoords } from './grid-coords';

export class GridCell extends phaser.GameObjects.Image {
    constructor(scene: phaser.Scene, assetKey: AssetKeys, gridX: number, gridY: number) {
        const { gridCellSize } = ConfigProvider.getConfig();
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1], assetKey);

        scene.add.existing(this);

        this.setDisplaySize(gridCellSize, gridCellSize);
    }

    getGridPos(): [number, number] {
        return GridCoords.getGridPosFromCoords(this.x, this.y);
    }

    isAdjacent(to: GridCell): boolean {
        const thisCoords = this.getGridPos();
        const toCoords = to.getGridPos();
        const xDiff = Math.abs(thisCoords[0] - toCoords[0]);
        const yDiff = Math.abs(thisCoords[1] - toCoords[1]);

        return (xDiff + yDiff === 1) || (xDiff === 1 && yDiff === 1);
    }
}
