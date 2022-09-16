import { Handler } from '@yandex-cloud/function-types';
import { cloudApi, serviceClients, Session } from '@yandex-cloud/nodejs-sdk';
import { functionResponse } from '../../utils/function-response';
import { withDb } from '../../db/with-db';
import { User } from '../../db/entity/user';
import { ServerStateBuilder } from '../../utils/server-state-builder';
import { logger } from '../../../common/logger';
import { ServerState } from '../../../common/types';
import { StateUpdateMessage } from '../../../common/ws/messages';

const { serverless: { apigateway_connection_service: connectionService } } = cloudApi;

const cloudApiSession = new Session();
const wsClient = cloudApiSession.client(serviceClients.WebSocketConnectionServiceClient);

export const handler = withDb<Handler.MessageQueue>(async (dbSess, event, context) => {
    const usersToNotify = await User.allWithWsConnection(dbSess);

    if (usersToNotify.length > 0) {
        const stateBuilder = await ServerStateBuilder.create(dbSess);

        // Each player should receive personal state
        const allJobs = usersToNotify.map(async (user) => {
            const serverState: ServerState = stateBuilder.buildState(user.id);
            const message: StateUpdateMessage = {
                type: 'state-update',
                payload: serverState,
            };
            const request = connectionService.SendToConnectionRequest.fromPartial({
                connectionId: user.wsConnectionId,
                type: connectionService.SendToConnectionRequest_DataType.TEXT,
                data: Buffer.from(JSON.stringify(message), 'utf8'),
            });

            try {
                await wsClient.send(request);
            } catch {
                logger.warn(`Unable to send message to connection: ${user.wsConnectionId}`);
            }
        });

        await Promise.all(allJobs);
    }

    return functionResponse({});
});
