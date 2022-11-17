import { Handler } from '@yandex-cloud/function-types';
import { functionResponse } from '../../utils/function-response';
import { withDb } from '../../db/with-db';
import { User } from '../../db/entity/user';
import { ServerStateBuilder } from '../../utils/server-state-builder';
import { logger } from '../../../common/logger';
import { ServerState } from '../../../common/types';
import { StateUpdateMessage } from '../../../common/ws/messages';
import { safeJsonParse } from '../../../common/utils/safe-json-parse';
import { sendCompressedMessage } from '../../utils/ws';

export const handler = withDb<Handler.MessageQueue>(async (dbSess, event, context) => {
    const usersToNotify = await User.allWithWsConnection(dbSess);
    const updateSources = event.messages.map((m) => {
        const body = safeJsonParse<{ updateSource: string }>(m.details.message.body);

        return body ? body.updateSource : '';
    });

    logger.info(`Got ${event.messages.length} messages from YMQ`);

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
