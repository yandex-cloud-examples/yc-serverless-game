import { Grid } from './objects/grid/grid';
import { Player } from './objects/player';

export class GridMoveManager {
    private readonly player: Player;
    private readonly grid: Grid;

    constructor(grid: Grid, player: Player) {
        this.player = player;
        this.grid = grid;
    }
}
