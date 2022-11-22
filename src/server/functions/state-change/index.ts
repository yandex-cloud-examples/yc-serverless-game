import { Handler } from '@yandex-cloud/function-types';
import { functionResponse } from '../../utils/function-response';
import { withDb } from '../../db/with-db';
import { User } from '../../db/entity/user';
import { ServerStateBuilder } from '../../utils/server-state-builder';
import { logger } from '../../../common/logger';
import { NotifyStateChangeMessage, RectCoords, ServerState } from '../../../common/types';
import { StateUpdateMessage } from '../../../common/ws/messages';
import { sendCompressedMessage } from '../../utils/ws';

export const handler = withDb<Handler.DataStreams>(async (dbSess, event, context) => {
    logger.info(`Got ${event.messages.length} messages from YDS`);

    const notifyMessages = event.messages as NotifyStateChangeMessage[];
    const updateSources = notifyMessages.map((m) => m.updateSource);
    const affectedCoords = notifyMessages.map((m) => m.gridCoords);
    const usersToNotify = await User.allWithFOVInCoordsAndWs(dbSess, affectedCoords);

    logger.debug('Affected users: ', usersToNotify.map((u) => u.tgUsername));

    if (usersToNotify.length > 0) {
        const fovArea: RectCoords = usersToNotify
            .reduce(
                (result, user) => {
                    return [
                        [
                            Math.min(result[0][0], user.fovTlX ?? Number.POSITIVE_INFINITY),
                            Math.min(result[0][1], user.fovTlY ?? Number.POSITIVE_INFINITY),
                        ],
                        [
                            Math.max(result[1][0], user.fovBrX ?? Number.NEGATIVE_INFINITY),
                            Math.max(result[1][1], user.fovBrY ?? Number.NEGATIVE_INFINITY),
                        ],
                    ];
                },
                [
                    [Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY],
                    [Number.NEGATIVE_INFINITY, Number.NEGATIVE_INFINITY],
                ],
            );

        logger.debug('Building state withing area: ', fovArea);

        const stateBuilder = await ServerStateBuilder.create(dbSess, fovArea);

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
