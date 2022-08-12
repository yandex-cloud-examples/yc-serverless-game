import playerImage from './assets/images/player.png';
import groundImage from './assets/images/ground.png';

export const enum AssetKeys {
    Player = 'player',
    Ground = 'ground',
}

export const AssetFiles: Record<AssetKeys, string> = {
    [AssetKeys.Player]: playerImage,
    [AssetKeys.Ground]: groundImage,
};
