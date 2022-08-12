import phaser from 'phaser';
import { AssetFiles, AssetKeys } from '../assets';
import { Grid } from '../objects/grid/grid';
import { GlobalConfigProvider } from '../utils/global-config-provider';
import { Player } from '../objects/player';
import { GridCoords } from '../objects/grid/grid-coords';
import { GridMoveManager } from '../grid-move-manager';

export class MainScene extends phaser.Scene {
    private _player: Player | undefined;
    private get player() {
        if (!this._player) {
            throw new Error('Player is not created yet');
        }

        return this._player;
    }
    private set player(player: Player) {
        if (this._player) {
            throw new Error('Player has been already set');
        }

        this._player = player;
    }

    private _grid: Grid | undefined;
    private get grid() {
        if (!this._grid) {
            throw new Error('Grid is not created yet');
        }

        return this._grid;
    }
    private set grid(grid: Grid) {
        if (this._grid) {
            throw new Error('Grid has been already set');
        }

        this._grid = grid;
    }

    constructor() {
        super('main');
    }

    preload() {
        this.load.image(AssetKeys.Ground, AssetFiles[AssetKeys.Ground]);
        this.load.image(AssetKeys.Player, AssetFiles[AssetKeys.Player]);
    }

    create() {
        const { worldGridSize } = GlobalConfigProvider.getConfig();
        const worldSize = GridCoords.getBoundsFromGridPos(worldGridSize[0], worldGridSize[1]);

        this.grid = new Grid(this, AssetKeys.Ground);
        this.player = new Player(this, AssetKeys.Player, 0, 0);

        const gridManager = new GridMoveManager(this.grid, this.player);

        this.cameras.main.startFollow(this.player);

        this.physics.world.setBounds(0, 0, worldSize[0], worldSize[1]);
    }

    update(time: number, delta: number) {}
}
