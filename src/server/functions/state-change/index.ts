import { Handler } from '@yandex-cloud/function-types';
import { compact } from 'lodash';
import { functionResponse } from '../../utils/function-response';
import { withDb } from '../../db/with-db';
import { User } from '../../db/entity/user';
import { ServerStateBuilder } from '../../utils/server-state-builder';
import { logger } from '../../../common/logger';
import { NotifyStateChangeMessage, RectCoords, ServerState } from '../../../common/types';
import { StateUpdateMessage } from '../../../common/ws/messages';
import { safeJsonParse } from '../../../common/utils/safe-json-parse';
import { sendCompressedMessage } from '../../utils/ws';

const getAffectedArea = (messages: NotifyStateChangeMessage[]): RectCoords => {
    let minX = messages[0].gridCoords[0];
    let minY = messages[0].gridCoords[1];
    let maxX = minX;
    let maxY = minY;

    for (const m of messages) {
        if (m.gridCoords[0] > maxX) {
            maxX = m.gridCoords[0];
        }

        if (m.gridCoords[0] < minX) {
            minX = m.gridCoords[0];
        }

        if (m.gridCoords[1] > maxY) {
            maxY = m.gridCoords[1];
        }

        if (m.gridCoords[1] < minY) {
            minY = m.gridCoords[1];
        }
    }

    return [[minX, minY], [maxX, maxY]];
};

export const handler = withDb<Handler.MessageQueue>(async (dbSess, event, context) => {
    logger.info(`Got ${event.messages.length} messages from YMQ`);

    const notifyMessages = compact(event.messages.map((m) => safeJsonParse<NotifyStateChangeMessage>(m.details.message.body)));
    const updateSources = notifyMessages.map((m) => m.updateSource);
    const affectedArea = getAffectedArea(notifyMessages);
    const usersToNotify = await User.allWithFOVInAreaAndWs(dbSess, affectedArea);

    logger.debug('Affected area: ', affectedArea);
    logger.debug('Affected users: ', usersToNotify.map((u) => u.tgUsername));

    if (usersToNotify.length > 0) {
        const stateBuilder = await ServerStateBuilder.create(dbSess);

        // Each player should receive personal state
        const allJobs = usersToNotify.map(async (user) => {
            const serverState: ServerState = stateBuilder.buildState(user.id);
            const message: StateUpdateMessage = {
                type: 'state-update',
                payload: serverState,
                meta: { updateSources },
            };

            try {
                // Absolutely sure wsConnectionId is not empty since queried from DB only users with connectionId
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                await sendCompressedMessage(user.wsConnectionId!, message);
            } catch (error) {
                logger.warn(`Unable to send message to connection: ${user.wsConnectionId}: ${error}`);
            }
        });

        await Promise.all(allJobs);
    }

    return functionResponse({});
});
