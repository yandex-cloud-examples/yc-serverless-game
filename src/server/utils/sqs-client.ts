import { SQS } from '@aws-sdk/client-sqs';
import { getEnv } from './get-env';

const YMQ_WRITER_ACCESS_KEY_ID = getEnv('YMQ_WRITER_ACCESS_KEY_ID');
const YMQ_WRITER_SECRET_ACCESS_KEY = getEnv('YMQ_WRITER_SECRET_ACCESS_KEY');

export const sqsClient = new SQS({
    region: 'ru-central1',
    endpoint: 'https://message-queue.api.cloud.yandex.net',
    credentials: {
        accessKeyId: YMQ_WRITER_ACCESS_KEY_ID,
        secretAccessKey: YMQ_WRITER_SECRET_ACCESS_KEY,
    },
});
