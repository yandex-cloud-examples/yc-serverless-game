import * as phaser from 'phaser';
import { AssetKeys } from '../../assets';
import { ConfigProvider } from '../../game-config/config-provider';
import { GridCoords } from './grid-coords';

const COLOR_MASK_ALPHA = 0.4;
const SELECTED_COLOR = 0x00_DD_00;

export class GridCell extends phaser.GameObjects.Image {
    private color: string | undefined = undefined;
    private colorMask: phaser.GameObjects.Rectangle;
    private isSelected = false;

    constructor(scene: phaser.Scene, assetKey: AssetKeys, gridX: number, gridY: number) {
        const { gridCellSize } = ConfigProvider.getConfig();
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1], assetKey);

        scene.add.existing(this);

        this.setDisplaySize(gridCellSize, gridCellSize);

        // init color mask
        this.colorMask = this.scene.add.rectangle(
            coords[0],
            coords[1],
            gridCellSize,
            gridCellSize,
            undefined,
            COLOR_MASK_ALPHA,
        ).setVisible(false);
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

    setColor(color?: string) {
        this.color = color;

        if (!this.isSelected) {
            this.resetState();
        }
    }

    setSelected() {
        this.isSelected = true;

        this.colorMask
            .setFillStyle(SELECTED_COLOR, COLOR_MASK_ALPHA)
            .setVisible(true);
    }

    resetState() {
        this.isSelected = false;

        if (this.color) {
            this.colorMask
                .setFillStyle(Number.parseInt(this.color, 16), COLOR_MASK_ALPHA)
                .setVisible(true);
        } else {
            this.colorMask.setVisible(false);
        }
    }
}
