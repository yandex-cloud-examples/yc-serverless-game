import { ConfigProvider } from '../../game-config/config-provider';
import { Coords, RectCoords } from '../../../common/types';

const FOV_EXTENSION = 2;

const ensureCoordInBound = (c: number, bound: number): number => {
    if (c >= 0 && c < bound) {
        return c;
    }

    if (c < 0) {
        return 0;
    }

    return bound;
};

export class GridCoords {
    private static configProvider = ConfigProvider;

    static get gridCellSize() {
        return this.configProvider.getConfig().gridCellSize;
    }

    static getCoordsFromGridPos(gridX: number, gridY: number): Coords {
        const x = gridX * this.gridCellSize + this.gridCellSize / 2;
        const y = gridY * this.gridCellSize + this.gridCellSize / 2;

        return [x, y];
    }

    static getGridPosFromCoords(x: number, y: number): Coords {
        const gridX = Math.round((x - this.gridCellSize / 2) / this.gridCellSize);
        const gridY = Math.round((y - this.gridCellSize / 2) / this.gridCellSize);

        return [gridX, gridY];
    }

    static getBoundsFromGridPos(gridX: number, gridY: number): Coords {
        const boundX = gridX * this.gridCellSize;
        const boundY = gridY * this.gridCellSize;

        return [boundX, boundY];
    }

    /*
        @returns [[topLeftX, topLeftY], [bottomRightX, bottomRightY]]
     */
    static getFieldOfView(left: number, top: number, right: number, bottom: number): RectCoords {
        const { worldGridSize } = this.configProvider.getConfig();

        const topLeftGrid = this.getGridPosFromCoords(left, top);
        const bottomRightGrid = this.getGridPosFromCoords(right, bottom);

        return [
            [
                ensureCoordInBound(topLeftGrid[0] - FOV_EXTENSION, worldGridSize[0]),
                ensureCoordInBound(topLeftGrid[1] - FOV_EXTENSION, worldGridSize[1]),
            ],
            [
                ensureCoordInBound(bottomRightGrid[0] + FOV_EXTENSION, worldGridSize[0]),
                ensureCoordInBound(bottomRightGrid[1] + FOV_EXTENSION, worldGridSize[1]),
            ],
        ];
    }

    static equals(a: Coords, b: Coords): boolean {
        return a[0] === b[0] && a[1] === b[1];
    }
}
