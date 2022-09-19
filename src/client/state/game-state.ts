import {
    action, makeObservable, observable, computed,
} from 'mobx';

import { ServerState, UserState } from '../../common/types';
import { updateDiff } from '../../common/utils/update-diff';
import { createLogger } from '../../common/logger';

const logger = createLogger('GameState');

export class GameState {
    @observable me: ServerState['me'];
    @observable players: ServerState['players'];
    @observable grid: ServerState['grid'];
    @observable stats: ServerState['stats'];

    @computed
    get onlineCount(): number {
        return this.players.length + 1;
    }

    constructor(initialState: ServerState) {
        this.me = initialState.me;
        this.players = initialState.players;
        this.grid = initialState.grid;
        this.stats = initialState.stats;

        makeObservable(this);
    }

    @action
    update(newState: ServerState) {
        logger.debug('Received request to update state', newState);

        updateDiff(this.me, newState.me);
        updateDiff(this.grid, newState.grid);
        updateDiff(this.players, newState.players);
        updateDiff(this.stats, newState.stats);
    }

    @action
    moveMeTo(gridX: number, gridY: number): boolean {
        logger.debug('Called moveMeTo', [gridX, gridY]);

        const isCellFree = !this.players.some((p) => p.gridX === gridX && p.gridY === gridY);

        // do not allow to move to cell where another player is located
        if (!isCellFree) {
            return false;
        }

        this.me.gridX = gridX;
        this.me.gridY = gridY;
        this.me.state = UserState.DEFAULT;

        return true;
    }
}
