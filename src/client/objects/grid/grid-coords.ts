import { GlobalConfigProvider } from '../../utils/global-config-provider';

export class GridCoords {
    private static configProvider = GlobalConfigProvider;

    static get blockSize() {
        return this.configProvider.getConfig().groundBlockSize;
    }

    static getCoordsFromGridPos(gridX: number, gridY: number): [number, number] {
        const x = gridX * this.blockSize + this.blockSize / 2;
        const y = gridY * this.blockSize + this.blockSize / 2;

        return [x, y];
    }

    static getGridPosFromCoords(x: number, y: number): [number, number] {
        const gridX = Math.round((x - this.blockSize / 2) / this.blockSize);
        const gridY = Math.round((y - this.blockSize / 2) / this.blockSize);

        return [gridX, gridY];
    }

    static getBoundsFromGridPos(gridX: number, gridY: number): [number, number] {
        const boundX = gridX * this.blockSize;
        const boundY = gridY * this.blockSize;

        return [boundX, boundY];
    }
}
