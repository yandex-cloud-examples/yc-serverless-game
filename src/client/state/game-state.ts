import { makeObservable, observable, action } from 'mobx';

import { ServerState } from '../../common/types';

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
        this.me = newState.me;
        this.grid = newState.grid;
        this.players = newState.players;
    }
}
