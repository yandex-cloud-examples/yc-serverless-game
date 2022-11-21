import { KinesisClient } from '@aws-sdk/client-kinesis';
import { getEnv } from './get-env';

const YDS_WRITER_ACCESS_KEY_ID = getEnv('YDS_WRITER_ACCESS_KEY_ID');
const YDS_WRITER_SECRET_ACCESS_KEY = getEnv('YDS_WRITER_SECRET_ACCESS_KEY');

export const kinesisClient = new KinesisClient({
    region: 'ru-central1',
    endpoint: 'https://yds.serverless.yandexcloud.net',
    credentials: {
        accessKeyId: YDS_WRITER_ACCESS_KEY_ID,
        secretAccessKey: YDS_WRITER_SECRET_ACCESS_KEY,
    },
});
