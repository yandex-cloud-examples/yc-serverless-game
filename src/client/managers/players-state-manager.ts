import * as phaser from 'phaser';
import { autorun } from 'mobx';
import { bind } from 'bind-decorator';

import { Player } from '../objects/player';
import { GameState } from '../state/game-state';
import { GridCoords } from '../objects/grid/grid-coords';
import { UserState } from '../../common/types';

export class PlayersStateManager {
    private me: Player | undefined;
    // ID -> Player map
    private enemies: Map<string, Player> = new Map();

    constructor(
        private gameState: GameState,
        private scene: phaser.Scene,
    ) {
        autorun(this.updateMeState);
        autorun(this.updatePlayersState);
    }

    getMe(): Player {
        if (!this.me) {
            throw new Error('Me player is not set up yet');
        }

        return this.me;
    }

    @bind
    private updateMeState() {
        const meState = this.gameState.me;

        if (!this.me) {
            this.me = new Player(
                this.scene,
                meState.color,
                meState.imageType,
                meState.avatar,
                false,
                meState.gridX,
                meState.gridY,
            );
        } else {
            const meCoords = this.me.getGridPos();

            if (!GridCoords.equals(meCoords, [meState.gridX, meState.gridY])) {
                this.me.moveToGridCell(meState.gridX, meState.gridY);
            }
        }

        this.me.setCapturingState(meState.state === UserState.CAPTURING);
    }

    @bind
    private updatePlayersState() {
        const playersState = this.gameState.players;

        for (const state of playersState) {
            let player: Player | undefined = this.enemies.get(state.id);

            if (!player) {
                player = new Player(
                    this.scene,
                    state.color,
                    state.imageType,
                    state.avatar,
                    true,
                    state.gridX,
                    state.gridY,
                );

                this.enemies.set(state.id, player);
            }

            if (!GridCoords.equals(player.getGridPos(), [state.gridX, state.gridY])) {
                player.moveToGridCell(state.gridX, state.gridY);
            }

            player.setCapturingState(state.state === UserState.CAPTURING);
        }

        // Remove players which are not in state anymore
        for (const entry of this.enemies) {
            const id = entry[0];
            const player = entry[1];

            if (!playersState.some((p) => p.id === id)) {
                this.enemies.delete(id);

                player.destroy();
            }
        }
    }
}
