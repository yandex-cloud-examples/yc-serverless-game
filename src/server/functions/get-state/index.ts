import { FunctionHandler } from '@yandex-cloud/function-types';
import { User } from '../../db/entity/user';
import { withDb } from '../../db/with-db';
import { functionResponse } from '../../utils/function-response';
import { PlayerState, ServerState } from '../../../common/types';
import { GridCell } from '../../db/entity/grid-cell';
import { defaultLogger } from '../../../common/logger';

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

export const handler = withDb<FunctionHandler>(async (dbSess, event, context) => {
    const meId: string = (event.requestContext.authorizer as Record<string, string>).userId;

    const { resultSets: usersResultSets } = await dbSess.executeQuery('SELECT * FROM Users');
    const users = User.fromResultSet(usersResultSets[0]);
    const me = users.find((u) => u.id === meId);

    if (!me) {
        throw new Error(`Unable to find me in DB: ${meId}`);
    }

    const serverState: ServerState = {
        grid: {},
        players: [],
        me: userToPlayerState(me),
    };

    for (const user of users) {
        if (user.id !== meId) {
            serverState.players.push(userToPlayerState(user));
        }
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
            defaultLogger.error(`Unable to find owner for cell ${cell.x}:${cell.y}`);
        }
    }

    return functionResponse(serverState);
});
