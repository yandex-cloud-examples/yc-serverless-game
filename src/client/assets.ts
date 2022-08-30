import playerImage from './assets/images/player.png';
import groundImage from './assets/images/ground.png';
import defaultAvatarImage from './assets/images/default-avatar.png';
import progressImage from './assets/images/progress.png';

export const enum AssetKeys {
    Player = 'player',
    Ground = 'ground',
    DefaultAvatar = 'default-avatar',
    Progress = 'progress',
}

export const AssetFiles: Record<AssetKeys, string> = {
    [AssetKeys.Player]: playerImage,
    [AssetKeys.Ground]: groundImage,
    [AssetKeys.DefaultAvatar]: defaultAvatarImage,
    [AssetKeys.Progress]: progressImage,
};
