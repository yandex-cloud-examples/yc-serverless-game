import defaultAvatarImage from './assets/images/default-avatar.png';
import mapType1Image from './assets/images/map/type1.svg';
import mapType2Image from './assets/images/map/type2.svg';
import mapType3Image from './assets/images/map/type3.svg';
import mapType4Image from './assets/images/map/type4.svg';
import playerType1Image from './assets/images/player/type1.png';
import playerType2Image from './assets/images/player/type2.png';
import playerType3Image from './assets/images/player/type3.png';
import playerType4Image from './assets/images/player/type4.png';
import playerMaskType1Image from './assets/images/player/mask/type1.png';
import playerMaskType2Image from './assets/images/player/mask/type2.png';
import playerMaskType3Image from './assets/images/player/mask/type3.png';
import playerMaskType4Image from './assets/images/player/mask/type4.png';
import backgroundImage from './assets/images/bg.png';
import timerImage from './assets/images/timer.png';

export const enum AssetKeys {
    Player1 = 'player1',
    Player2 = 'player2',
    Player3 = 'player3',
    Player4 = 'player4',
    PlayerMask1 = 'player-mask1',
    PlayerMask2 = 'player-mask2',
    PlayerMask3 = 'player-mask3',
    PlayerMask4 = 'player-mask4',
    Map1 = 'map1',
    Map2 = 'map2',
    Map3 = 'map3',
    Map4 = 'map4',
    DefaultAvatar = 'default-avatar',
    Background = 'background',
    Timer = 'timer',
}

export const AssetFiles: Record<AssetKeys, string> = {
    [AssetKeys.Player1]: playerType1Image,
    [AssetKeys.Player2]: playerType2Image,
    [AssetKeys.Player3]: playerType3Image,
    [AssetKeys.Player4]: playerType4Image,
    [AssetKeys.PlayerMask1]: playerMaskType1Image,
    [AssetKeys.PlayerMask2]: playerMaskType2Image,
    [AssetKeys.PlayerMask3]: playerMaskType3Image,
    [AssetKeys.PlayerMask4]: playerMaskType4Image,
    [AssetKeys.Map1]: mapType1Image,
    [AssetKeys.Map2]: mapType2Image,
    [AssetKeys.Map3]: mapType3Image,
    [AssetKeys.Map4]: mapType4Image,
    [AssetKeys.DefaultAvatar]: defaultAvatarImage,
    [AssetKeys.Background]: backgroundImage,
    [AssetKeys.Timer]: timerImage,
};
