import { PutRecordCommand } from '@aws-sdk/client-kinesis';

import { getEnv } from './get-env';
import { logger } from '../../common/logger';
import { Coords, NotifyStateChangeMessage } from '../../common/types';
import { kinesisClient } from './kinesis-client';

const YDS_STREAM_NAME = getEnv('YDS_STREAM_NAME');
const encoder = new TextEncoder();

export const notifyStateChange = async (updateSource: string, gridCoords: Coords) => {
    const message: NotifyStateChangeMessage = {
        updateSource,
        gridCoords,
    };

    try {
        await kinesisClient.send(new PutRecordCommand({
            StreamName: YDS_STREAM_NAME,
            PartitionKey: updateSource,
            Data: encoder.encode(JSON.stringify(message)),
        }));
    } catch (error) {
        logger.error(`Failed to put message to stream: ${JSON.stringify(error)}`);
    }
};
