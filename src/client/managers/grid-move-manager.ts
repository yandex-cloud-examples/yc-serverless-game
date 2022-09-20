import { bind } from 'bind-decorator';
import { Mutex } from 'async-mutex';

import { Grid } from '../objects/grid/grid';
import { Player } from '../objects/player';
import { GridCell } from '../objects/grid/grid-cell';
import { GameState } from '../state/game-state';
import { ApiClient } from '../api';
import { createLogger } from '../../common/logger';

const MOVE_MUTEX_RELEASE_TIMEOUT_MS = 2000;
const logger = createLogger('GridMoveManager');

export class GridMoveManager {
    private selectedCell: GridCell | null = null;
    private moveMutex = new Mutex();

    constructor(
        private readonly grid: Grid,
        private readonly player: Player,
        private readonly apiClient: ApiClient,
        private readonly gameState: GameState,
    ) {
        this.grid.onCellClick(this.onCellClick);
    }

    @bind
    private async onCellClick(gridPos: [number, number]) {
        if (this.moveMutex.isLocked()) {
            logger.debug('Move mutex is locked since previous move is not completed yet');

            // do not allow move while previous one is not completed
            return;
        }

        const releaseLock = await this.moveMutex.acquire();
        const timeout = setTimeout(releaseLock, MOVE_MUTEX_RELEASE_TIMEOUT_MS);
        const playerPos = this.player.getGridPos();
        const playerGridCell = this.grid.getCell(playerPos[0], playerPos[1]);
        const clickedCell = this.grid.getCell(gridPos[0], gridPos[1]);

        if (playerGridCell.isAdjacent(clickedCell) && this.gameState.moveMeTo(gridPos[0], gridPos[1])) {
            // do not wait for promise resolution intentionally
            await this.apiClient.moveTo(gridPos[0], gridPos[1]);
        }

        clearTimeout(timeout);
        releaseLock();

        /* if (clickedCell === this.selectedCell) {
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
        } */
    }
}
