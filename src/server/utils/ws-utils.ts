import { Session } from 'ydb-sdk';
import { Session as ApiSession, cloudApi, serviceClients } from '@yandex-cloud/nodejs-sdk';
import { User } from '../db/entity/user';
import { executeQuery } from '../db/execute-query';
import { logger } from '../../common/logger';

const { serverless: { apigateway_connection_service: { SendToConnectionRequest } } } = cloudApi;

const cloudApiSession = new ApiSession();
const wsConnectionsClient = cloudApiSession.client(serviceClients.WebSocketConnectionServiceClient);

// @returns list of id of notified users
export const notifyAll = async (dbSess: Session, message: unknown): Promise<string[]> => {
    const query = `
        SELECT * FROM Users WHERE ws_connection_id IS NOT NULL
    `;
    const { resultSets } = await executeQuery(dbSess, query);
    const users = User.fromResultSet(resultSets[0]);

    if (users.length > 0) {
        const allPromises = users.map(async (u) => {
            try {
                await wsConnectionsClient.send(SendToConnectionRequest.fromPartial({
                    connectionId: u.wsConnectionId,
                    data: Buffer.from(JSON.stringify(message)),
                }));
            } catch (error) {
                logger.warn(`Unable to send message to user ${u.id} with connectionId: ${u.wsConnectionId}: ${error}`);
            }
        });

        await Promise.all(allPromises);
    }

    return users.map((u) => u.id);
};
