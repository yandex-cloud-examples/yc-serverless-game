import * as phaser from 'phaser';
import * as uuid from 'uuid';
import CircleMaskImage from 'phaser3-rex-plugins/plugins/circlemaskimage';
import { ConfigProvider } from '../game-config/config-provider';
import { GridCoords } from './grid/grid-coords';
import { AssetKeys } from '../assets';
import { PLAYER_MOVE_DURATION_MS } from '../constants';
import { ValueHolder } from '../../common/utils/value-holder';
import { logger } from '../../common/logger';

const PLAYER_ASSET_KEYS: AssetKeys[] = [
    AssetKeys.Player1,
    AssetKeys.Player2,
    AssetKeys.Player3,
    AssetKeys.Player4,
];

export class Player extends phaser.GameObjects.Container {
    private readonly bodyAssetKey: AssetKeys;
    private readonly bodyImage: ValueHolder<phaser.Types.Physics.Arcade.SpriteWithDynamicBody> = new ValueHolder();
    private readonly avatarImage: ValueHolder<CircleMaskImage> = new ValueHolder();
    private readonly timerIcon: ValueHolder<phaser.Types.Physics.Arcade.SpriteWithDynamicBody> = new ValueHolder();

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
        const coords = GridCoords.getCoordsFromGridPos(gridX, gridY);

        super(scene, coords[0], coords[1]);

        this.bodyAssetKey = PLAYER_ASSET_KEYS[imageType - 1];

        this.initBody(colorHex);
        this.initAvatar(avatarUrl);
        this.initTimerIcon();

        scene.physics.systems.add.existing(this);
    }

    private initBody(colorHex: string) {
        const { playerSize } = ConfigProvider.getConfig();

        this.bodyImage.set(this.scene.physics.add.sprite(0, 0, this.bodyAssetKey, 2)
            .setDisplaySize(playerSize, playerSize)
            .setTint(Number.parseInt(colorHex, 16)));

        this.add(this.bodyImage.get());
    }

    private async initAvatar(avatarUrl?: string) {
        const { playerSize } = ConfigProvider.getConfig();
        const avatarSize = Math.round(playerSize / 1.8);
        const avatarPos: [number, number] = [
            0.8 * avatarSize,
            -0.8 * avatarSize,
        ];

        let assetKey: string = AssetKeys.DefaultAvatar;

        if (avatarUrl) {
            const randomKey = `avatar-${uuid.v4()}`;

            this.scene.load.image(randomKey, avatarUrl);

            try {
                await new Promise<void>((resolve, reject) => {
                    this.scene.load.once(phaser.Loader.Events.COMPLETE, () => {
                        this.scene.load.off(phaser.Loader.Events.FILE_LOAD_ERROR, reject);

                        resolve();
                    });
                    this.scene.load.once(phaser.Loader.Events.FILE_LOAD_ERROR, () => {
                        this.scene.load.off(phaser.Loader.Events.COMPLETE, resolve);

                        reject();
                    });

                    this.scene.load.start();
                });

                assetKey = randomKey;
            } catch {
                logger.warn(`Unable to load avatar image ${avatarUrl}, using default one instead`);
            }
        }

        this.avatarImage.set(new CircleMaskImage(this.scene, avatarPos[0], avatarPos[1], assetKey)
            .setDisplaySize(avatarSize, avatarSize));

        this.add(this.avatarImage.get());
    }

    private initTimerIcon() {
        const { playerSize } = ConfigProvider.getConfig();
        const timerIconsSize = Math.round(playerSize / 3);
        const timerPos = [
            -1.5 * timerIconsSize,
            -1.5 * timerIconsSize,
        ];

        this.timerIcon.set(this.scene.physics.add.sprite(timerPos[0], timerPos[1], AssetKeys.Timer)
            .setDisplaySize(timerIconsSize, timerIconsSize)
            .setVisible(false));

        this.add(this.timerIcon.get());
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

        this.bodyImage.get().setAngle(this.calculateMoveAngle(gridX, gridY));
        this.setCapturingState(false);

        this.bodyImage.get().play(this.getBodyAnimation());

        this.scene.tweens.add({
            targets: this,
            x: coords[0],
            y: coords[1],
            duration: PLAYER_MOVE_DURATION_MS,
        });
    }

    setCapturingState(isCapturing: boolean) {
        if (isCapturing) {
            this.timerIcon.get().play(this.getTimerAnimation(), true);
        }

        this.timerIcon.get().setVisible(isCapturing);
    }
}
