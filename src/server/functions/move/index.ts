import { Handler } from '@yandex-cloud/function-types';
import { withDb } from '../../db/with-db';

import { functionResponse } from '../../utils/function-response';
import { User } from '../../db/entity/user';
import { safeJsonParse } from '../../utils/safe-json-parse';

interface MoveRequest {
    gridX: number;
    gridY: number;
}

export const handler = withDb<Handler.Http>(async (dbSess, event, context) => {
    const moveRequest = safeJsonParse<Partial<MoveRequest>>(event.body);

    if (typeof moveRequest?.gridX !== 'number' || typeof moveRequest.gridY !== 'number') {
        return functionResponse({
            error: 'Bad request body, { gridX, gridY } expected',
        }, 400);
    }

    const meId: string = (event.requestContext.authorizer as Record<string, string>).userId;

    const { resultSets: usersResultSets } = await dbSess.executeQuery('SELECT * FROM Users');
    const users = User.fromResultSet(usersResultSets[0]);
    const me = users.find((u) => u.id === meId);

    if (!me) {
        throw new Error(`Unable to find me in DB: ${meId}`);
    }

    if (me.gridX !== moveRequest.gridX || me.gridY !== moveRequest.gridY) {
        me.gridX = moveRequest.gridX;
        me.gridY = moveRequest.gridY;

        const moveQuery = await dbSess.prepareQuery(`
            DECLARE $gridX AS UINT32;
            DECLARE $gridY AS UINT32;
            DECLARE $id AS UTF8;
            
            UPDATE Users SET grid_x = $gridX, grid_y = $gridY WHERE id == $id;
        `);

        await dbSess.executeQuery(moveQuery, {
            $id: me.getTypedValue('id'),
            $gridX: me.getTypedValue('gridX'),
            $gridY: me.getTypedValue('gridY'),
        });
    }

    return functionResponse({});
});
