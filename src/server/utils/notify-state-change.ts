import { getEnv } from './get-env';
import { sqsClient } from './sqs-client';
import { logger } from '../../common/logger';
import { Coords } from '../../common/types';

const YMQ_QUEUE_URL = getEnv('YMQ_STATE_CHANGE_URL');

export const notifyStateChange = async (updateSource: string, gridCoords: Coords) => {
    try {
        await sqsClient.sendMessage({
            QueueUrl: YMQ_QUEUE_URL,
            MessageBody: JSON.stringify({ updateSource, gridCoords }),
        });
    } catch (error) {
        logger.error(`Failed to put message to queue: ${JSON.stringify(error)}`);
    }
};
