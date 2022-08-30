import { Session, TypedValues } from 'ydb-sdk';
import { SQS } from '@aws-sdk/client-sqs';

import { User } from '../../db/entity/user';
import { GridCell } from '../../db/entity/grid-cell';
import { CapturingMessage, UserState } from '../../../common/types';
import { getEnv } from '../../utils/get-env';

const YMQ_WRITER_ACCESS_KEY_ID = getEnv('YMQ_WRITER_ACCESS_KEY_ID');
const YMQ_WRITER_SECRET_ACCESS_KEY = getEnv('YMQ_WRITER_SECRET_ACCESS_KEY');
const YMQ_QUEUE_URL = getEnv('YMQ_QUEUE_URL');

const sqsClient = new SQS({
    region: 'ru-central1',
    endpoint: 'https://message-queue.api.cloud.yandex.net',
    credentials: {
        accessKeyId: YMQ_WRITER_ACCESS_KEY_ID,
        secretAccessKey: YMQ_WRITER_SECRET_ACCESS_KEY,
    },
});

export const canBeCaptured = async (dbSess: Session, playerId: string, gridX: number, gridY: number): Promise<boolean> => {
    const playerQuery = await dbSess.prepareQuery(`
        DECLARE $id AS UTF8;
        SELECT * FROM Users WHERE id = $id LIMIT 1;
    `);
    const { resultSets: usersResultSets } = await dbSess.executeQuery(playerQuery, {
        $id: TypedValues.utf8(playerId),
    });
    const users = User.fromResultSet(usersResultSets[0]);
    const player = users.find((u) => u.id === playerId);

    if (!player) {
        throw new Error(`User ${playerId} not found in DB`);
    }

    const cellQuery = await dbSess.prepareQuery(`
        DECLARE $gridX AS UINT32;
        DECLARE $gridY AS UINT32;
        SELECT * FROM GridCells WHERE x = $gridX AND y = $gridY LIMIT 1;
    `);
    const { resultSets: cellResultsSet } = await dbSess.executeQuery(cellQuery, {
        $gridX: TypedValues.uint32(gridX),
        $gridY: TypedValues.uint32(gridY),
    });
    const cells = GridCell.fromResultSet(cellResultsSet[0]);

    return cells.length === 0 || cells[0].ownerId !== playerId;
};

export const startCapture = async (dbSess: Session, playerId: string, gridX: number, gridY: number, durationSec: number) => {
    const updatePlayerStateQuery = await dbSess.prepareQuery(`
        DECLARE $id AS UTF8;
        DECLARE $state AS UTF8;
        UPDATE Users SET state = $state WHERE id = $id;
    `);

    await dbSess.executeQuery(updatePlayerStateQuery, {
        $id: TypedValues.utf8(playerId),
        $state: TypedValues.utf8(UserState.CAPTURING),
    });

    const message: CapturingMessage = {
        playerId,
        gridX,
        gridY,
    };

    await sqsClient.sendMessage({
        QueueUrl: YMQ_QUEUE_URL,
        MessageBody: JSON.stringify(message),
        DelaySeconds: durationSec,
    });
};
