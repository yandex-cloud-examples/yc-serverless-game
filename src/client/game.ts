import phaser from 'phaser';
import { ConfigProvider } from './game-config/config-provider';
import { MainScene } from './scene/main';
import { ApiClient } from './api/client';
import { GameState } from './state/game-state';

export class ServerlessGame {
    private readonly apiClient: ApiClient;
    private game: phaser.Game | undefined;

    constructor() {
        this.apiClient = new ApiClient();
    }

    async init() {
        const gameConfig = await this.apiClient.getConfig();
        const serverState = await this.apiClient.getState();

        if (!serverState) {
            throw new Error('Server state is possible stale at game init stage');
        }

        const gameState = new GameState(serverState);

        ConfigProvider.init(gameConfig);

        const mainScene = new MainScene(gameState, this.apiClient);

        this.game = new phaser.Game({
            type: phaser.AUTO,
            width: '100%',
            height: '100%',
            parent: 'game',
            scene: mainScene,
            input: {
                keyboard: false,
                mouse: true,
                touch: true,
            },
            fps: {
                target: 24,
            },
            physics: {
                default: 'arcade',
            },
        });
    }
}
