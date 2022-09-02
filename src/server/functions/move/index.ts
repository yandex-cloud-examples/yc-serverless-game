import { Handler } from '@yandex-cloud/function-types';
import { withDb } from '../../db/with-db';

import { functionResponse } from '../../utils/function-response';
import { User } from '../../db/entity/user';
import { safeJsonParse } from '../../utils/safe-json-parse';
import { tryCapture } from './helpers';
import { UserState } from '../../../common/types';
import { CAPTURING_DEFAULT_DURATION_S } from '../../utils/constants';
import { executeQuery } from '../../db/execute-query';

interface MoveRequest {
    gridX: number;
    gridY: number;
}

// TODO: add restrictions
// - same position
// - adjacent
// - out of bounds
export const handler = withDb<Handler.Http>(async (dbSess, event, context) => {
    const moveRequest = safeJsonParse<Partial<MoveRequest>>(event.body);

    if (typeof moveRequest?.gridX !== 'number' || typeof moveRequest.gridY !== 'number') {
        return functionResponse({
            error: 'Bad request body, { gridX, gridY } expected',
        }, 400);
    }

    const meId: string = event.requestContext.authorizer?.userId;

    const me = await User.findById(dbSess, meId);

    if (!me) {
        throw new Error(`Unable to find me in DB: ${meId}`);
    }

    if (me.gridX !== moveRequest.gridX || me.gridY !== moveRequest.gridY) {
        me.gridX = moveRequest.gridX;
        me.gridY = moveRequest.gridY;
        me.state = UserState.DEFAULT;

        const moveQuery = `
            DECLARE $gridX AS UINT32;
            DECLARE $gridY AS UINT32;
            DECLARE $id AS UTF8;
            DECLARE $state AS UTF8;
            
            UPDATE Users SET state = $state, grid_x = $gridX, grid_y = $gridY WHERE id == $id;
        `;

        await executeQuery(dbSess, moveQuery, {
            $id: me.getTypedValue('id'),
            $gridX: me.getTypedValue('gridX'),
            $gridY: me.getTypedValue('gridY'),
            $state: me.getTypedValue('state'),
        });

        await tryCapture(dbSess, me, CAPTURING_DEFAULT_DURATION_S);
    }

    return functionResponse({});
});