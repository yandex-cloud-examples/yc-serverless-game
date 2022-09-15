import { Grid } from '../objects/grid/grid';
import { GridMoveManager } from '../managers/grid-move-manager';
import { GameStatePoller } from '../state/game-state-poller';
import { PlayersStateManager } from '../managers/players-state-manager';
import { GridStateManager } from '../managers/grid-state-manager';
import { HeaderInfoManager } from '../managers/header-info-manager';
import { BaseScene } from './base';

export class MainScene extends BaseScene {
    create() {
        const grid = new Grid(this);
        const playersStateManager = new PlayersStateManager(this.gameState, this);
        const me = playersStateManager.getMe();
        const gridStateManager = new GridStateManager(this.gameState, grid);
        const gridMoveManager = new GridMoveManager(grid, me, this.apiClient, this.gameState);
        const scoreManager = new HeaderInfoManager(this.gameState, this, '#header');
        const gameStatePoller = new GameStatePoller(this.apiClient, this.gameState);

        this.cameras.main.startFollow(me);
        this.physics.world.setBounds(0, 0, this.worldSize[0], this.worldSize[1]);

        gameStatePoller.start();
    }
}
