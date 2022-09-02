import { Session, TypedValues } from 'ydb-sdk';
import { SQS } from '@aws-sdk/client-sqs';

import { User } from '../../db/entity/user';
import { GridCell } from '../../db/entity/grid-cell';
import { CapturingMessage, UserState } from '../../../common/types';
import { getEnv } from '../../utils/get-env';
import { executeQuery } from '../../db/execute-query';

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

export const canBeCaptured = async (dbSess: Session, player: User): Promise<boolean> => {
    const cellQuery = `
        DECLARE $gridX AS UINT32;
        DECLARE $gridY AS UINT32;
        SELECT * FROM GridCells WHERE x = $gridX AND y = $gridY LIMIT 1;
    `;
    const { resultSets: cellResultsSet } = await executeQuery(dbSess, cellQuery, {
        $gridX: TypedValues.uint32(player.gridX),
        $gridY: TypedValues.uint32(player.gridY),
    });
    const cells = GridCell.fromResultSet(cellResultsSet[0]);

    return cells.length === 0 || cells[0].ownerId !== player.id;
};

export const tryCapture = async (dbSess: Session, player: User, durationSec: number) => {
    if (!await canBeCaptured(dbSess, player)) {
        return;
    }

    const updatePlayerStateQuery = `
        DECLARE $id AS UTF8;
        DECLARE $state AS UTF8;
        UPDATE Users SET state = $state WHERE id = $id;
    `;

    await executeQuery(dbSess, updatePlayerStateQuery, {
        $id: TypedValues.utf8(player.id),
        $state: TypedValues.utf8(UserState.CAPTURING),
    });

    const message: CapturingMessage = {
        playerId: player.id,
        gridX: player.gridX,
        gridY: player.gridY,
    };

    await sqsClient.sendMessage({
        QueueUrl: YMQ_QUEUE_URL,
        MessageBody: JSON.stringify(message),
        DelaySeconds: durationSec,
    });
};
