import * as phaser from 'phaser';
import { AssetKeys } from '../../assets';
import { GlobalConfigProvider } from '../../utils/global-config-provider';
import { Ground } from '../ground';

export class Grid {
    private readonly grid: Map<number, Map<number, Ground>> = new Map();
    private readonly gridSize: [number, number];

    constructor(scene: phaser.Scene, groundAssetKey: AssetKeys) {
        this.gridSize = GlobalConfigProvider.getConfig().worldGridSize;

        for (let gridX = 0; gridX < this.gridSize[0]; gridX++) {
            let yMap = this.grid.get(gridX);

            if (!yMap) {
                yMap = new Map();

                this.grid.set(gridX, yMap);
            }

            for (let gridY = 0; gridY < this.gridSize[1]; gridY++) {
                const ground = new Ground(scene, groundAssetKey, gridX, gridY);

                yMap.set(gridY, ground);
            }
        }
    }
}
