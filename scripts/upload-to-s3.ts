import * as path from 'path';
import * as fs from 'fs';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import fg from 'fast-glob';
import mimeTypes from 'mime-types';

const FILES_BASE_DIR = path.resolve('./dist/client');

const client = new S3Client({
    region: 'ru-central1',
    endpoint: 'https://storage.yandexcloud.net',
});

const uploadFile = (filePath: string) => {
    const contentType = mimeTypes.lookup(filePath) || 'text/plain';

    const command = new PutObjectCommand({
        Bucket: 'serverless-game-files',
        Key: path.relative(FILES_BASE_DIR, filePath),
        Body: fs.createReadStream(filePath),
        ContentType: contentType,
    });

    return client.send(command);
};

const files = fg.sync('**/*', {
    cwd: path.resolve(FILES_BASE_DIR),
    absolute: true,
});

for (const file of files) {
    uploadFile(file);
}
