import { autorun } from 'mobx';
import { bind } from 'bind-decorator';

import { Grid } from '../objects/grid/grid';
import { GameState } from '../state/game-state';
import { ConfigProvider } from '../game-config/config-provider';

export class GridStateManager {
    constructor(
        private readonly gameState: GameState,
        private readonly grid: Grid,
    ) {
        autorun(this.updateGridState);
    }

    @bind
    private updateGridState() {
        const gridState = this.gameState.grid;
        const { worldGridSize } = ConfigProvider.getConfig();

        for (let x = 0; x < worldGridSize[0]; x++) {
            for (let y = 0; y < worldGridSize[1]; y++) {
                const cellState = gridState[x]?.[y];
                const cell = this.grid.getCell(x, y);

                if (cellState) {
                    cell.setColor(cellState.ownerColor);
                } else {
                    cell.setColor();
                }
            }
        }
    }
}
