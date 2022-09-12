import { Grid } from '../objects/grid/grid';
import { GameStatePoller } from '../state/game-state-poller';
import { PlayersStateManager } from '../managers/players-state-manager';
import { GridStateManager } from '../managers/grid-state-manager';
import { BaseScene } from './base';

export class StatsScene extends BaseScene {
    create() {
        const grid = new Grid(this);
        const playersStateManager = new PlayersStateManager(this.gameState, this);
        const gridStateManager = new GridStateManager(this.gameState, grid);
        const gameStatePoller = new GameStatePoller(this.apiClient, this.gameState);

        this.physics.world.setBounds(0, 0, this.worldSize[0], this.worldSize[1]);

        this.cameras.main.setZoom(this.calculateZoom());
        this.cameras.main.centerOn(this.worldSize[0] / 2, this.worldSize[1] / 2);

        gameStatePoller.start();
        playersStateManager.getMe().setVisible(false);
    }

    private calculateZoom() {
        const { worldSize, game: { canvas } } = this;
        const clientSize = [canvas.clientWidth, canvas.clientHeight];
        const wRatio = clientSize[0] / worldSize[0];
        const hRatio = clientSize[1] / worldSize[1];
        const ratio = Math.min(wRatio, hRatio);

        return Math.round(ratio * 100) / 100;
    }
}
