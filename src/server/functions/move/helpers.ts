import { Session, TypedValues } from 'ydb-sdk';

import { User } from '../../db/entity/user';
import { GridCell } from '../../db/entity/grid-cell';
import { CapturingMessage, UserState } from '../../../common/types';
import { getEnv } from '../../utils/get-env';
import { executeQuery } from '../../db/execute-query';
import { MoveRequest } from './types';
import { getGameConfig } from '../../utils/get-game-config';
import { ValidationError } from './validation-error';
import { isPlayerActive } from '../../utils/is-player-active';
import { sqsClient } from '../../utils/sqs-client';

const YMQ_QUEUE_URL = getEnv('YMQ_CAPTURE_URL');
const MAX_MOVE_DISTANCE = 2;

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

export const validateMoveRequest = async (dbSess: Session, player: User, moveRequest: MoveRequest): Promise<void> => {
    if (player.gridX === moveRequest.gridX && player.gridY === moveRequest.gridY) {
        throw new ValidationError(`Requested to move to same position where player is: ${moveRequest.gridX}:${moveRequest.gridY}`);
    }

    const gameConfig = await getGameConfig(dbSess);
    const { worldGridSize } = gameConfig;

    if (moveRequest.gridX >= worldGridSize[0] || moveRequest.gridX < 0 || moveRequest.gridY >= worldGridSize[1] || moveRequest.gridY < 0) {
        throw new ValidationError(`Requested to move to out of bounds (${worldGridSize[0]}x${worldGridSize[1]})`);
    }

    const maxDistance = Math.max(
        Math.abs(player.gridX - moveRequest.gridX),
        Math.abs(player.gridY - moveRequest.gridY),
    );

    if (maxDistance > MAX_MOVE_DISTANCE) {
        throw new ValidationError('Requested to move to distance bigger then allowed');
    }

    const playerOnCell = await User.findByGridPos(dbSess, moveRequest.gridX, moveRequest.gridY);

    if (playerOnCell && isPlayerActive(gameConfig, playerOnCell)) {
        throw new ValidationError(`Another player is on this cell: ${moveRequest.gridX}:${moveRequest.gridY}`);
    }
};
