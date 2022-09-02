import defaultAvatarImage from './assets/images/default-avatar.png';
import mapType1Image from './assets/images/map/type1.svg';
import mapType2Image from './assets/images/map/type2.svg';
import mapType3Image from './assets/images/map/type3.svg';
import mapType4Image from './assets/images/map/type4.svg';
import playerType1Image from './assets/images/player/type1.png';
import playerType2Image from './assets/images/player/type2.png';
import playerType3Image from './assets/images/player/type3.png';
import playerType4Image from './assets/images/player/type4.png';
import backgroundImage from './assets/images/bg.png';
import timerImage from './assets/images/timer.png';

export const enum AssetKeys {
    Player1 = 'player1',
    Player2 = 'player2',
    Player3 = 'player3',
    Player4 = 'player4',
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
    [AssetKeys.Map1]: mapType1Image,
    [AssetKeys.Map2]: mapType2Image,
    [AssetKeys.Map3]: mapType3Image,
    [AssetKeys.Map4]: mapType4Image,
    [AssetKeys.DefaultAvatar]: defaultAvatarImage,
    [AssetKeys.Background]: backgroundImage,
    [AssetKeys.Timer]: timerImage,
};
