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
import { compressMessage, decompressMessage } from '../../utils/ws';
import { safeJsonParse } from '../../../common/utils/safe-json-parse';

export const handler = withDb<Handler.Http>(async (dbSess, event) => {
    const meId = event.requestContext.authorizer?.userId;
    const message = event.isBase64Encoded ? decompressMessage(event.body) : safeJsonParse<ClientMessage>(event.body);

    if (!message) {
        throw new Error(`Unable to parse incoming message: ${JSON.stringify(message)}`);
    }

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
        me.fovTlX = moveRequest.fov[0][0];
        me.fovTlY = moveRequest.fov[0][1];
        me.fovBrX = moveRequest.fov[1][0];
        me.fovBrY = moveRequest.fov[1][1];
        me.state = UserState.DEFAULT;

        const moveQuery = `
            DECLARE $gridX AS UINT32;
            DECLARE $gridY AS UINT32;
            DECLARE $fovTlX AS UINT32;
            DECLARE $fovTlY AS UINT32;
            DECLARE $fovBrX AS UINT32;
            DECLARE $fovBrY AS UINT32;
            DECLARE $id AS UTF8;
            DECLARE $state AS UTF8;
            
            UPDATE 
                Users 
            SET 
                state = $state, 
                grid_x = $gridX, 
                grid_y = $gridY, 
                fov_tl_x = $fovTlX, 
                fov_tl_y = $fovTlY, 
                fov_br_x = $fovBrX, 
                fov_br_y = $fovBrY 
            WHERE id == $id;
        `;

        await executeQuery(dbSess, moveQuery, {
            $id: me.getTypedValue('id'),
            $gridX: me.getTypedValue('gridX'),
            $gridY: me.getTypedValue('gridY'),
            $state: me.getTypedValue('state'),
            $fovTlX: me.getTypedValue('fovTlX'),
            $fovTlY: me.getTypedValue('fovTlY'),
            $fovBrX: me.getTypedValue('fovBrX'),
            $fovBrY: me.getTypedValue('fovBrY'),
        });

        await tryCapture(dbSess, me, CAPTURING_DEFAULT_DURATION_S);
        await notifyStateChange('ws-move', [moveRequest.gridX, moveRequest.gridY]);

        const stateBuilder = await ServerStateBuilder.create(dbSess);
        const responseMessage: MoveResponseMessage = {
            type: 'move-response',
            payload: stateBuilder.buildState(meId),
        };

        return {
            statusCode: 200,
            body: compressMessage(responseMessage).toString('base64'),
            isBase64Encoded: true,
        };
    }

    return functionResponse({});
});
