import { cloudApi, serviceClients, Session } from '@yandex-cloud/nodejs-sdk';
import { gzipSync, gunzipSync } from 'zlib';
import { ClientMessage, ServerMessage } from '../../common/ws/messages';
import { safeJsonParse } from '../../common/utils/safe-json-parse';

const { serverless: { apigateway_connection_service: connectionService } } = cloudApi;

const cloudApiSession = new Session();
const wsClient = cloudApiSession.client(serviceClients.WebSocketConnectionServiceClient);

export const compressMessage = (message: ServerMessage) => {
    const stringified = JSON.stringify(message);

    return gzipSync(Buffer.from(stringified, 'utf8'));
};

export const decompressMessage = (compressed: string): ClientMessage | undefined => {
    const decompressed = gunzipSync(Buffer.from(compressed, 'base64'));

    return safeJsonParse(decompressed.toString('utf8'));
};

export const sendCompressedMessage = async (connectionId: string, message: ServerMessage) => {
    const request = connectionService.SendToConnectionRequest.fromPartial({
        connectionId,
        type: connectionService.SendToConnectionRequest_DataType.BINARY,
        data: compressMessage(message),
    });

    return wsClient.send(request);
};
