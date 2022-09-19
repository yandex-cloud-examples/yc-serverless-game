import { Handler } from '@yandex-cloud/function-types';

import { functionResponse } from '../../utils/function-response';
import { withDb } from '../../db/with-db';
import { ClientMessage, MoveResponseMessage } from '../../../common/ws/messages';
import { User } from '../../db/entity/user';
import { tryCapture, validateMoveRequest } from '../move/helpers';
import { ValidationError } from '../move/validation-error';
import { UserState } from '../../../common/types';
import { executeQuery } from '../../db/execute-query';
import { CAPTURING_DEFAULT_DURATION_S } from '../../utils/constants';
import { notifyStateChange } from '../../utils/notify-state-change';
import { updateLastActive } from '../../utils/update-last-active';
import { probablyCall } from '../../utils/probably-call';
import { ServerStateBuilder } from '../../utils/server-state-builder';

export const handler = withDb<Handler.Http>(async (dbSess, event) => {
    const meId = event.requestContext.authorizer?.userId;
    const message: ClientMessage = JSON.parse(event.body);

    if (message.type === 'move-request') {
        const moveRequest = message.payload;

        const me = await User.findById(dbSess, meId);

        if (!me) {
            throw new Error(`Unable to find me in DB: ${meId}`);
        }

        // Do not update lastActive on every move in order to avoid overhead
        await probablyCall(0.4, () => updateLastActive(meId, dbSess));

        try {
            await validateMoveRequest(dbSess, me, moveRequest);
        } catch (error) {
            if (error instanceof ValidationError) {
                return error.toFunctionResponse();
            }

            throw error;
        }

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
        await notifyStateChange('ws-move');

        const stateBuilder = await ServerStateBuilder.create(dbSess);
        const response: MoveResponseMessage = {
            type: 'move-response',
            payload: stateBuilder.buildState(meId),
        };

        return functionResponse(response);
    }

    return functionResponse({});
});
