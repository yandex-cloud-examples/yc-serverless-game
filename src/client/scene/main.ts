import { Grid } from '../objects/grid/grid';
import { GridMoveManager } from '../managers/grid-move-manager';
import { GameStateUpdaterHttp } from '../state/game-state-updater-http';
import { PlayersStateManager } from '../managers/players-state-manager';
import { GridStateManager } from '../managers/grid-state-manager';
import { HeaderInfoManager } from '../managers/header-info-manager';
import { BaseScene } from './base';
import { GameStateUpdaterWs } from '../state/game-state-updater-ws';
import { ConfigProvider } from '../game-config/config-provider';
import { ApiClient } from '../api';

export class MainScene extends BaseScene {
    create() {
        const gameConfig = ConfigProvider.getConfig();

        let apiClient: ApiClient;
        let gameStateUpdater: unknown;

        switch (gameConfig.transport) {
            case 'ws':
                apiClient = this.wsClient;
                gameStateUpdater = new GameStateUpdaterWs(this.wsClient, this.gameState);
                break;
            default:
                apiClient = this.httpClient;
                gameStateUpdater = new GameStateUpdaterHttp(this.httpClient, this.gameState);
        }

        const grid = new Grid(this);
        const playersStateManager = new PlayersStateManager(this.gameState, this);
        const me = playersStateManager.getMe();
        const gridStateManager = new GridStateManager(this.gameState, grid);
        const gridMoveManager = new GridMoveManager(grid, me, apiClient, this.gameState);
        const headerManager = new HeaderInfoManager(this.gameState, this, '#header');

        this.cameras.main.startFollow(me);
        this.physics.world.setBounds(0, 0, this.worldSize[0], this.worldSize[1]);
    }
}
