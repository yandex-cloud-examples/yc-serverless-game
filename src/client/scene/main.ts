import phaser, { Game } from 'phaser';
import { AssetFiles, AssetKeys } from '../assets';
import { Grid } from '../objects/grid/grid';
import { ConfigProvider } from '../game-config/config-provider';
import { GridCoords } from '../objects/grid/grid-coords';
import { GridMoveManager } from '../managers/grid-move-manager';
import { GameState } from '../state/game-state';
import { GameStatePoller } from '../state/game-state-poller';
import { ApiClient } from '../api/client';
import { PlayersStateManager } from '../managers/players-state-manager';
import { GridStateManager } from '../managers/grid-state-manager';
import { ScoreManager } from '../managers/score-manager';

const PLAYER_SPRITE_FRAME_CONFIG: phaser.Types.Loader.FileTypes.ImageFrameConfig = {
    frameWidth: 81,
    frameHeight: 81,
};

export class MainScene extends phaser.Scene {
    private gameState: GameState;
    private apiClient: ApiClient;

    constructor(gameState: GameState, apiClient: ApiClient) {
        super('main');

        this.gameState = gameState;
        this.apiClient = apiClient;
    }

    private get worldSize() {
        const { worldGridSize } = ConfigProvider.getConfig();

        return GridCoords.getBoundsFromGridPos(worldGridSize[0], worldGridSize[1]);
    }

    preload() {
        // map images
        this.load.image(AssetKeys.Map1, AssetFiles[AssetKeys.Map1]);
        this.load.image(AssetKeys.Map2, AssetFiles[AssetKeys.Map2]);
        this.load.image(AssetKeys.Map3, AssetFiles[AssetKeys.Map3]);
        this.load.image(AssetKeys.Map4, AssetFiles[AssetKeys.Map4]);

        // player sprites
        this.load.spritesheet(AssetKeys.Player1, AssetFiles[AssetKeys.Player1], PLAYER_SPRITE_FRAME_CONFIG);
        this.load.spritesheet(AssetKeys.Player2, AssetFiles[AssetKeys.Player2], PLAYER_SPRITE_FRAME_CONFIG);
        this.load.spritesheet(AssetKeys.Player3, AssetFiles[AssetKeys.Player3], PLAYER_SPRITE_FRAME_CONFIG);
        this.load.spritesheet(AssetKeys.Player4, AssetFiles[AssetKeys.Player4], PLAYER_SPRITE_FRAME_CONFIG);
        this.load.image(AssetKeys.PlayerMask1, AssetFiles[AssetKeys.PlayerMask1]);
        this.load.image(AssetKeys.PlayerMask2, AssetFiles[AssetKeys.PlayerMask2]);
        this.load.image(AssetKeys.PlayerMask3, AssetFiles[AssetKeys.PlayerMask3]);
        this.load.image(AssetKeys.PlayerMask4, AssetFiles[AssetKeys.PlayerMask4]);

        // rest
        this.load.image(AssetKeys.DefaultAvatar, AssetFiles[AssetKeys.DefaultAvatar]);
        this.load.spritesheet(AssetKeys.Timer, AssetFiles[AssetKeys.Timer], {
            frameHeight: 31,
            frameWidth: 31,
            spacing: 2,
        });
        this.load.image(AssetKeys.Background, AssetFiles[AssetKeys.Background]);
    }

    create() {
        // TODO: find another way to set background image
        this.add.tileSprite(
            0,
            0,
            this.worldSize[0] * 2,
            this.worldSize[1] * 2,
            AssetKeys.Background,
        );

        const grid = new Grid(this);
        const playersStateManager = new PlayersStateManager(this.gameState, this);
        const gridStateManager = new GridStateManager(this.gameState, grid);
        const me = playersStateManager.getMe();
        const gridMoveManager = new GridMoveManager(grid, me, this.apiClient, this.gameState);
        const scoreManager = new ScoreManager(this.gameState, this, '#score');

        this.cameras.main.startFollow(me);
        this.physics.world.setBounds(0, 0, this.worldSize[0], this.worldSize[1]);

        const gameStatePoller = new GameStatePoller(this.apiClient, this.gameState);

        gameStatePoller.start();
    }

    // update(time: number, delta: number) {}
}
