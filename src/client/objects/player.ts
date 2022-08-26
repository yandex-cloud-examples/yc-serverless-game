import * as phaser from 'phaser';
import * as uuid from 'uuid';
import { AssetKeys } from '../assets';
import { ConfigProvider } from '../game-config/config-provider';
import { GridCoords } from './grid/grid-coords';

export class Player extends phaser.GameObjects.Container {
    private readonly bodyImage: phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    private readonly avatarImage: phaser.Types.Physics.Arcade.ImageWithDynamicBody;

    constructor(
        scene: phaser.Scene,
        bodyAssetKey: AssetKeys,
        defaultAvatarAssetKey: AssetKeys,
        colorHex: string,
        avatarUrl?: string,
        gridX = 0,
        gridY = 0,
    ) {
        const { playerSize } = ConfigProvider.getConfig();

        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1]);

        this.bodyImage = scene.physics.add.image(0, 0, bodyAssetKey)
            .setDisplaySize(playerSize, playerSize)
            .setTint(Number.parseInt(colorHex, 16));

        const avatarSize = Math.round(playerSize / 3);

        this.avatarImage = scene.physics.add.image(0, 0, defaultAvatarAssetKey)
            .setDisplaySize(avatarSize, avatarSize);

        if (avatarUrl) {
            this.loadAvatar(avatarUrl);
        }

        this.add([
            this.bodyImage,
            this.avatarImage,
        ]);

        scene.physics.systems.add.existing(this);
    }

    private loadAvatar(url: string) {
        const uniqKey = `avatar-${uuid.v4()}`;

        this.scene.load.image(uniqKey, url);
        this.scene.load.once(phaser.Loader.Events.COMPLETE, () => {
            this.avatarImage.setTexture(uniqKey);
        });
        this.scene.load.start();
    }

    getGridPos(): [number, number] {
        return GridCoords.getGridPosFromCoords(this.x, this.y);
    }

    moveToGridCell(gridX: number, gridY: number, animate = true) {
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        if (animate) {
            this.scene.tweens.add({
                targets: this,
                x: coords[0],
                y: coords[1],
                duration: 300,
            });
        } else {
            this.setX(coords[0]);
            this.setY(coords[1]);
        }
    }
}
