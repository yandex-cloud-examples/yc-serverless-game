import phaser from 'phaser';
import { bind } from 'bind-decorator';
import { debounce } from 'lodash';
import { ConfigProvider } from './game-config/config-provider';
import { MainScene } from './scene/main';
import { HttpClient } from './api/http-client';
import { GameState } from './state/game-state';
import { WsClient } from './api/ws-client';

export class ServerlessGame {
    private readonly httpApiClient: HttpClient;
    private readonly wsApiClient: WsClient;
    private readonly parentEl: HTMLElement;
    private game: phaser.Game | undefined;

    constructor(parentElementSelector: string) {
        this.httpApiClient = new HttpClient();
        this.wsApiClient = new WsClient(this.httpApiClient);

        const parentEl = document.querySelector<HTMLElement>(parentElementSelector);

        if (!parentEl) {
            throw new Error(`Parent element was not found in DOM by selector ${parentElementSelector}`);
        }

        this.parentEl = parentEl;
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
            parent: this.parentEl,
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

        window.addEventListener('resize', debounce(this.onWindowResize, 300));
    }

    @bind
    private onWindowResize() {
        const scaleConfig = this.getScaleConfig();
        const { width, height } = scaleConfig;

        if (typeof width === 'number' && typeof height === 'number') {
            this.game?.scale.resize(width, height);
        }
    }

    private getScaleConfig(): phaser.Types.Core.ScaleConfig {
        const dpr = window.devicePixelRatio || 1;
        const zoom = dpr / 3;
        const parentWidth = Math.ceil(this.parentEl.clientWidth / zoom);
        const parentHeight = Math.ceil(this.parentEl.clientHeight / zoom);

        return {
            width: parentWidth,
            height: parentHeight,
            mode: phaser.Scale.ScaleModes.NONE,
            autoRound: true,
            zoom,
        };
    }
}
