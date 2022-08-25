import { bind } from 'bind-decorator';

import { Grid } from '../objects/grid/grid';
import { Player } from '../objects/player';
import { GridCell } from '../objects/grid/grid-cell';
import { ApiClient } from '../api/client';

export class GridMoveManager {
    private selectedCell: GridCell | null = null;

    constructor(
        private readonly grid: Grid,
        private readonly player: Player,
        private readonly apiClient: ApiClient,
    ) {
        this.grid.onCellClick(this.onCellClick);
    }

    @bind
    private onCellClick(gridPos: [number, number]) {
        const playerPos = this.player.getGridPos();
        const playerGridCell = this.grid.getCell(playerPos[0], playerPos[1]);
        const clickedCell = this.grid.getCell(gridPos[0], gridPos[1]);

        if (clickedCell === this.selectedCell) {
            // do not wait for promise resolution intentionally
            this.apiClient.moveTo(gridPos[0], gridPos[1]);

            this.player.moveToGridCell(gridPos[0], gridPos[1]);

            this.selectedCell.clearTint().clearAlpha();
            this.selectedCell = null;
        } else if (playerGridCell.isAdjacent(clickedCell)) {
            if (this.selectedCell) {
                this.selectedCell.clearTint().clearAlpha();
            }

            this.selectedCell = clickedCell;

            this.selectedCell.setTint(0x00_FF_00);
            this.selectedCell.setAlpha(0.5);
        }
    }
}
