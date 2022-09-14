import {
    action, makeObservable, observable, computed,
} from 'mobx';

import { ServerState, UserState } from '../../common/types';
import { updateDiff } from '../../common/utils/update-diff';

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
        updateDiff(this.me, newState.me);
        updateDiff(this.grid, newState.grid);
        updateDiff(this.players, newState.players);
        updateDiff(this.stats, newState.stats);
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
}
