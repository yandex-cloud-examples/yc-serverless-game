import { bind } from 'bind-decorator';

import { Grid } from '../objects/grid/grid';
import { Player } from '../objects/player';
import { GridCell } from '../objects/grid/grid-cell';
import { GameState } from '../state/game-state';
import { ApiClient } from '../api';

export class GridMoveManager {
    private selectedCell: GridCell | null = null;

    constructor(
        private readonly grid: Grid,
        private readonly player: Player,
        private readonly apiClient: ApiClient,
        private readonly gameState: GameState,
    ) {
        this.grid.onCellClick(this.onCellClick);
    }

    @bind
    private onCellClick(gridPos: [number, number]) {
        const playerPos = this.player.getGridPos();
        const playerGridCell = this.grid.getCell(playerPos[0], playerPos[1]);
        const clickedCell = this.grid.getCell(gridPos[0], gridPos[1]);

        if (clickedCell === this.selectedCell) {
            if (this.gameState.moveMeTo(gridPos[0], gridPos[1])) {
                // do not wait for promise resolution intentionally
                this.apiClient.moveTo(gridPos[0], gridPos[1]);
            }

            this.selectedCell.resetState();
            this.selectedCell = null;
        } else if (playerGridCell.isAdjacent(clickedCell)) {
            if (this.selectedCell) {
                this.selectedCell.resetState();
            }

            this.selectedCell = clickedCell;
            this.selectedCell.setSelected();
        }
    }
}
