import { Session } from 'ydb-sdk';
import { PlayerState, ServerState } from '../../common/types';
import { User } from '../db/entity/user';
import { GridCell } from '../db/entity/grid-cell';
import { logger } from '../../common/logger';
import { getGameConfig } from './get-game-config';
import { isPlayerActive } from './is-player-active';

export const userToPlayerState = (user: User, gridCells: GridCell[]): PlayerState => {
    return {
        id: user.id,
        name: user.tgUsername,
        // select smallest possible size of avatar
        avatar: user.tgAvatar?.replace('/320/', '/160/'),
        color: user.color,
        state: user.state,
        gridX: user.gridX,
        gridY: user.gridY,
        imageType: user.imageType,
        score: user.calculateScore(gridCells),
    };
};

export const buildGameState = async (meId: string, dbSess: Session, withStats = false): Promise<ServerState> => {
    const config = await getGameConfig(dbSess);
    const users = await User.all(dbSess);
    const gridCells = await GridCell.all(dbSess);

    const me = users.find((u) => u.id === meId);

    if (!me) {
        throw new Error(`Unable to find me in DB: ${meId}`);
    }

    const activeEnemies = users.filter((u) => {
        return u.id !== meId && isPlayerActive(config, u);
    });

    const serverState: ServerState = {
        grid: {},
        players: [],
        me: userToPlayerState(me, gridCells),
        stats: {},
    };

    for (const enemy of activeEnemies) {
        serverState.players.push(userToPlayerState(enemy, gridCells));
    }

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

    if (withStats) {
        serverState.stats.topPlayers = users
            .map((u) => userToPlayerState(u, gridCells))
            .sort((a, b) => b.score - a.score)
            .slice(0, 15);
    }

    return serverState;
};
