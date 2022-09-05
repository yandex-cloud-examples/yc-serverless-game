import * as dateFns from 'date-fns';
import { GameConfig } from '../../common/types';
import { User } from '../db/entity/user';

export const isPlayerActive = (gameConfig: GameConfig, player: User): boolean => {
    return dateFns.differenceInSeconds(new Date(), player.lastActive) < gameConfig.maxInactiveSec;
};
