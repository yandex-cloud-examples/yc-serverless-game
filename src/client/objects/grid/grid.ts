import * as phaser from 'phaser';
import { AssetKeys } from '../../assets';
import { ConfigProvider } from '../../game-config/config-provider';
import { GridCell } from './grid-cell';
import { GridCoords } from './grid-coords';

type AbstractCallback = (...args: any[]) => void;

const CELL_ASSETS = [
    AssetKeys.Map1,
    AssetKeys.Map2,
    AssetKeys.Map3,
    AssetKeys.Map4,
];

export class Grid {
    private readonly grid: Map<number, Map<number, GridCell>> = new Map();
    private readonly gridSize: [number, number];
    private readonly eventListeners: Record<string, AbstractCallback[]> = {};

    constructor(scene: phaser.Scene) {
        this.gridSize = ConfigProvider.getConfig().worldGridSize;
        const coords = GridCoords.getBoundsFromGridPos(this.gridSize[0], this.gridSize[1]);

        for (let gridX = 0; gridX < this.gridSize[0]; gridX++) {
            let yMap = this.grid.get(gridX);

            if (!yMap) {
                yMap = new Map();

                this.grid.set(gridX, yMap);
            }

            for (let gridY = 0; gridY < this.gridSize[1]; gridY++) {
                const randomIndex = Math.floor(Math.random() * CELL_ASSETS.length);
                const cell = new GridCell(scene, CELL_ASSETS[randomIndex], gridX, gridY);

                cell.setInteractive();

                yMap.set(gridY, cell);
            }
        }

        scene.add.rectangle(3, 3, coords[0] - 6, coords[1] - 6)
            .setOrigin(0, 0)
            .setStrokeStyle(7, 0xFF_FF_FF)
            .setAlpha(0.6);

        scene.input.on(phaser.Input.Events.GAMEOBJECT_UP, (_: unknown, object: unknown) => {
            if (object instanceof GridCell) {
                const listeners = this.eventListeners[phaser.Input.Events.GAMEOBJECT_UP] || [];
                const gridPos = object.getGridPos();

                for (const callback of listeners) {
                    callback(gridPos);
                }
            }
        });
    }

    getCell(gridX: number, gridY: number): GridCell {
        const yMap = this.grid.get(gridX);

        if (!yMap) {
            throw new Error(`Cell with X pos ${gridX} is not found`);
        }

        const cell = yMap.get(gridY);

        if (!cell) {
            throw new Error(`Cell with pos ${gridX}:${gridY} is not found`);
        }

        return cell;
    }

    onCellClick(callback: (gridPos: [number, number]) => void) {
        if (!this.eventListeners[phaser.Input.Events.GAMEOBJECT_UP]) {
            this.eventListeners[phaser.Input.Events.GAMEOBJECT_UP] = [];
        }

        this.eventListeners[phaser.Input.Events.GAMEOBJECT_UP].push(callback);
    }
}
