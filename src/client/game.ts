import phaser from 'phaser';
import { ConfigProvider } from './game-config/config-provider';
import { MainScene } from './scene/main';
import { HttpClient } from './api/http-client';
import { GameState } from './state/game-state';
import { WsClient } from './api/ws-client';

export class ServerlessGame {
    private readonly httpApiClient: HttpClient;
    private readonly wsApiClient: WsClient;
    private game: phaser.Game | undefined;

    constructor() {
        this.httpApiClient = new HttpClient();
        this.wsApiClient = new WsClient(this.httpApiClient);
    }

    async init() {
        const gameConfig = await this.httpApiClient.getConfig();
        const serverState = await this.httpApiClient.getState();

        if (!serverState) {
            throw new Error('Server state is possible stale at game init stage');
        }

        const gameState = new GameState(serverState);

        ConfigProvider.init(gameConfig);

        const mainScene = new MainScene(gameState, this.httpApiClient);

        this.game = new phaser.Game({
            type: phaser.AUTO,
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
            scale: this.getScaleConfig(),
        });
    }

    private getScaleConfig(): phaser.Types.Core.ScaleConfig {
        const dpr = window.devicePixelRatio || 1;
        const zoom = dpr / 3;
        const whPrc = Math.ceil(100 / zoom);

        return {
            width: `${whPrc}%`,
            height: `${whPrc}%`,
            mode: phaser.Scale.ScaleModes.NONE,
            autoRound: true,
            zoom,
        };
    }
}
