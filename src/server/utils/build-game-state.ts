import { Session } from 'ydb-sdk';
import * as dateFns from 'date-fns';
import { PlayerState, ServerState } from '../../common/types';
import { User } from '../db/entity/user';
import { MAX_INACTIVE_S } from './constants';
import { GridCell } from '../db/entity/grid-cell';
import { logger } from '../../common/logger';

const userToPlayerState = (user: User): PlayerState => {
    return {
        id: user.id,
        name: user.tgUsername,
        avatar: user.tgAvatar,
        color: user.color,
        scores: 0,
        state: user.state,
        gridX: user.gridX,
        gridY: user.gridY,
    };
};

export const buildGameState = async (meId: string, dbSess: Session): Promise<ServerState> => {
    const users = await User.all(dbSess);
    const me = users.find((u) => u.id === meId);

    if (!me) {
        throw new Error(`Unable to find me in DB: ${meId}`);
    }

    const activeEnemies = users.filter((u) => {
        return u.id !== meId && dateFns.differenceInSeconds(new Date(), u.lastActive) < MAX_INACTIVE_S;
    });

    const serverState: ServerState = {
        grid: {},
        players: [],
        me: userToPlayerState(me),
    };

    for (const enemy of activeEnemies) {
        serverState.players.push(userToPlayerState(enemy));
    }

    const gridCells = await GridCell.all(dbSess);

    for (const cell of gridCells) {
        const owner = users.find((u) => { return u.id === cell.ownerId; });

        if (owner) {
            if (!serverState.grid[cell.x]) {
                serverState.grid[cell.x] = {};
            }

            serverState.grid[cell.x][cell.y] = {
                ownerColor: owner.color,
            };
        } else {
            logger.error(`Unable to find owner for cell ${cell.x}:${cell.y}`);
        }
    }

    return serverState;
};
