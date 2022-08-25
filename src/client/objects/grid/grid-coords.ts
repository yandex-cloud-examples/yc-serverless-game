import { ConfigProvider } from '../../game-config/config-provider';

export class GridCoords {
    private static configProvider = ConfigProvider;

    static get gridCellSize() {
        return this.configProvider.getConfig().gridCellSize;
    }

    static getCoordsFromGridPos(gridX: number, gridY: number): [number, number] {
        const x = gridX * this.gridCellSize + this.gridCellSize / 2;
        const y = gridY * this.gridCellSize + this.gridCellSize / 2;

        return [x, y];
    }

    static getGridPosFromCoords(x: number, y: number): [number, number] {
        const gridX = Math.round((x - this.gridCellSize / 2) / this.gridCellSize);
        const gridY = Math.round((y - this.gridCellSize / 2) / this.gridCellSize);

        return [gridX, gridY];
    }

    static getBoundsFromGridPos(gridX: number, gridY: number): [number, number] {
        const boundX = gridX * this.gridCellSize;
        const boundY = gridY * this.gridCellSize;

        return [boundX, boundY];
    }

    static equals(a: [number, number], b: [number, number]): boolean {
        return a[0] === b[0] && a[1] === b[1];
    }
}
