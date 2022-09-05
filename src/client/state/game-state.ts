import { action, makeObservable, observable } from 'mobx';
import * as deepDiff from 'deep-diff';

import { ServerState, UserState } from '../../common/types';
import { logger } from '../../common/logger';

export class GameState {
    @observable me: ServerState['me'];
    @observable players: ServerState['players'];
    @observable grid: ServerState['grid'];

    constructor(initialState: ServerState) {
        this.me = initialState.me;
        this.players = initialState.players;
        this.grid = initialState.grid;

        makeObservable(this);
    }

    @action
    update(newState: ServerState) {
        this.updateDiffOnly(this.me, newState.me);
        this.updateDiffOnly(this.grid, newState.grid);
        this.updateDiffOnly(this.players, newState.players);
    }

    @action
    moveMeTo(gridX: number, gridY: number): boolean {
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

    updateDiffOnly<T>(target: T, source: T) {
        const diff = deepDiff.diff(target, source);

        if (diff?.length) {
            for (const diffItem of diff) {
                deepDiff.applyChange(target, source, diffItem);
            }
        } else {
            logger.debug('There is not diff in old and new state');
        }
    }
}
