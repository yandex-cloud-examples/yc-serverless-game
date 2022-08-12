import { bind } from 'bind-decorator';

import { Grid } from './objects/grid/grid';
import { Player } from './objects/player';

export class GridMoveManager {
    private readonly player: Player;
    private readonly grid: Grid;

    constructor(grid: Grid, player: Player) {
        this.player = player;
        this.grid = grid;

        this.grid.onCellClick(this.onCellClick);
    }

    @bind
    private onCellClick(gridPos: [number, number]) {
        const playerPos = this.player.getGridPos();
        const playerGridCell = this.grid.getCell(playerPos[0], playerPos[1]);
        const clickedCell = this.grid.getCell(gridPos[0], gridPos[1]);

        if (playerGridCell.isAdjacent(clickedCell)) {
            this.player.moveToGridCell(gridPos[0], gridPos[1]);
        }
    }
}
