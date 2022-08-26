import { FunctionHandler } from '@yandex-cloud/function-types';
import * as dateFns from 'date-fns';
import { User } from '../../db/entity/user';
import { withDb } from '../../db/with-db';
import { functionResponse } from '../../utils/function-response';
import { PlayerState, ServerState } from '../../../common/types';
import { GridCell } from '../../db/entity/grid-cell';
import { logger } from '../../../common/logger';
import { MAX_INACTIVE_S } from '../../utils/constants';
import { updateLastActive } from '../../utils/update-last-active';

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

// calls function with given chance, in other cases no-op
const probablyCall = <F extends (...args: unknown[]) => R, R>(probability: number, fn: F): R | undefined => {
    if (Math.random() <= probability) {
        return fn();
    }

    return undefined;
};

export const handler = withDb<FunctionHandler>(async (dbSess, event, context) => {
    const meId: string = (event.requestContext.authorizer as Record<string, string>).userId;

    const { resultSets: usersResultSets } = await dbSess.executeQuery('SELECT * FROM Users');
    const users = User.fromResultSet(usersResultSets[0]);
    const me = users.find((u) => u.id === meId);

    if (!me) {
        throw new Error(`Unable to find me in DB: ${meId}`);
    }

    await probablyCall(0.2, () => updateLastActive(me, dbSess));

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

    const { resultSets: gridCellsResultSets } = await dbSess.executeQuery('SELECT * FROM GridCells');
    const gridCells = GridCell.fromResultSet(gridCellsResultSets[0]);

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

    return functionResponse(serverState);
});
