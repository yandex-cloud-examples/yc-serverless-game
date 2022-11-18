import { getEnv } from './get-env';
import { sqsClient } from './sqs-client';
import { logger } from '../../common/logger';
import { Coords, NotifyStateChangeMessage } from '../../common/types';

const YMQ_QUEUE_URL = getEnv('YMQ_STATE_CHANGE_URL');

export const notifyStateChange = async (updateSource: string, gridCoords: Coords) => {
    const message: NotifyStateChangeMessage = {
        updateSource,
        gridCoords,
    };

    try {
        await sqsClient.sendMessage({
            QueueUrl: YMQ_QUEUE_URL,
            MessageBody: JSON.stringify(message),
        });
    } catch (error) {
        logger.error(`Failed to put message to queue: ${JSON.stringify(error)}`);
    }
};
