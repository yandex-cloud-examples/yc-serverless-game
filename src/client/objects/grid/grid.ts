import * as phaser from 'phaser';
import { AssetKeys } from '../../assets';
import { GlobalConfigProvider } from '../../utils/global-config-provider';
import { GridCell } from './grid-cell';

type AbstractCallback = (...args: any[]) => void;

export class Grid {
    private readonly grid: Map<number, Map<number, GridCell>> = new Map();
    private readonly gridSize: [number, number];
    private readonly eventListeners: Record<string, AbstractCallback[]> = {};

    constructor(scene: phaser.Scene, groundAssetKey: AssetKeys) {
        this.gridSize = GlobalConfigProvider.getConfig().worldGridSize;

        for (let gridX = 0; gridX < this.gridSize[0]; gridX++) {
            let yMap = this.grid.get(gridX);

            if (!yMap) {
                yMap = new Map();

                this.grid.set(gridX, yMap);
            }

            for (let gridY = 0; gridY < this.gridSize[1]; gridY++) {
                const ground = new GridCell(scene, groundAssetKey, gridX, gridY);

                ground.setInteractive();

                yMap.set(gridY, ground);
            }
        }

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
