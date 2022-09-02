import * as phaser from 'phaser';
import * as uuid from 'uuid';
import { ConfigProvider } from '../game-config/config-provider';
import { GridCoords } from './grid/grid-coords';
import { AssetKeys } from '../assets';
import { PLAYER_MOVE_DURATION_MS } from '../constants';

const PLAYER_ASSET_KEYS: AssetKeys[] = [
    AssetKeys.Player1,
    AssetKeys.Player2,
    AssetKeys.Player3,
    AssetKeys.Player4,
];

export class Player extends phaser.GameObjects.Container {
    private readonly bodyAssetKey: AssetKeys;
    private readonly bodyImage: phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
    private readonly avatarImage: phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    private readonly timerIcon: phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

    private static playerAnimationsCache = new Map<AssetKeys, phaser.Animations.Animation>();
    private static timerAnimation: phaser.Animations.Animation;

    constructor(
        scene: phaser.Scene,
        colorHex: string,
        imageType: number,
        avatarUrl?: string,
        gridX = 0,
        gridY = 0,
    ) {
        const { playerSize } = ConfigProvider.getConfig();

        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1]);

        // Setup body image
        this.bodyAssetKey = PLAYER_ASSET_KEYS[imageType - 1];
        this.bodyImage = scene.physics.add.sprite(0, 0, this.bodyAssetKey, 2)
            .setDisplaySize(playerSize, playerSize)
            .setTint(Number.parseInt(colorHex, 16));

        // Setup avatar image
        const avatarSize = Math.round(playerSize / 3);

        this.avatarImage = scene.physics.add.image(0, 0, AssetKeys.DefaultAvatar)
            .setDisplaySize(avatarSize, avatarSize)
            .setVisible(false);

        if (avatarUrl) {
            this.loadAvatar(avatarUrl);
        }

        // Setup timer icon
        const timerIconsSize = Math.round(playerSize / 3);
        const timerPos = -1.9 * timerIconsSize;

        this.timerIcon = scene.physics.add.sprite(timerPos, timerPos, AssetKeys.Timer)
            .setOrigin(0, 0)
            .setDisplaySize(timerIconsSize, timerIconsSize)
            .setVisible(false);

        // Setup container
        this.add([
            this.bodyImage,
            this.avatarImage,
            this.timerIcon,
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

    private getBodyAnimation() {
        let anim = Player.playerAnimationsCache.get(this.bodyAssetKey);

        if (!anim) {
            const newAnim = this.scene.anims.create({
                key: `${this.bodyAssetKey}-move-anim`,
                frames: this.scene.anims.generateFrameNumbers(this.bodyAssetKey, {}),
                duration: PLAYER_MOVE_DURATION_MS,
            });

            if (!newAnim) {
                throw new Error(`Unable to create animation for body asset: ${this.bodyAssetKey}`);
            }

            anim = newAnim;

            Player.playerAnimationsCache.set(this.bodyAssetKey, anim);
        }

        return anim;
    }

    private getTimerAnimation() {
        if (!Player.timerAnimation) {
            const newAnim = this.scene.anims.create({
                key: 'timer-anim',
                frames: this.scene.anims.generateFrameNumbers(AssetKeys.Timer, {}),
                frameRate: 5,
                repeat: -1,
            });

            if (!newAnim) {
                throw new Error('Unable to create animation for timer');
            }

            Player.timerAnimation = newAnim;
        }

        return Player.timerAnimation;
    }

    private calculateMoveAngle(gridX: number, gridY: number): number {
        const currentPos = this.getGridPos();
        const xDiff = gridX - currentPos[0];
        const yDiff = gridY - currentPos[1];

        if (xDiff < 0) {
            if (yDiff < 0) {
                return 315;
            }
            if (yDiff === 0) {
                return 270;
            }
            if (yDiff > 0) {
                return 225;
            }
        }

        if (xDiff === 0) {
            if (yDiff < 0) {
                return 0;
            }
            if (yDiff > 0) {
                return 180;
            }
        }

        if (xDiff > 0) {
            if (yDiff < 0) {
                return 45;
            }
            if (yDiff === 0) {
                return 90;
            }
            if (yDiff > 0) {
                return 135;
            }
        }

        return 0;
    }

    getGridPos(): [number, number] {
        return GridCoords.getGridPosFromCoords(this.x, this.y);
    }

    moveToGridCell(gridX: number, gridY: number) {
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        this.bodyImage.setAngle(this.calculateMoveAngle(gridX, gridY));
        this.setCapturingState(false);

        this.bodyImage.play(this.getBodyAnimation());

        this.scene.tweens.add({
            targets: this,
            x: coords[0],
            y: coords[1],
            duration: PLAYER_MOVE_DURATION_MS,
        });
    }

    setCapturingState(isCapturing: boolean) {
        if (isCapturing) {
            this.timerIcon.play(this.getTimerAnimation(), true);
        }

        this.timerIcon.setVisible(isCapturing);
    }
}
