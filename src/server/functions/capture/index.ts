import { Handler } from '@yandex-cloud/function-types';
import { TypedValues } from 'ydb-sdk';
import { functionResponse } from '../../utils/function-response';
import { CapturingMessage, UserState } from '../../../common/types';
import { withDb } from '../../db/with-db';
import { User } from '../../db/entity/user';
import { logger } from '../../../common/logger';
import { executeQuery } from '../../db/execute-query';
import { notifyStateChange } from '../../utils/notify-state-change';
import { GridCell } from '../../db/entity/grid-cell';

export const handler = withDb<Handler.MessageQueue>(async (dbSess, event, context) => {
    logger.info(`Got ${event.messages.length} messages from YMQ`);

    const captureGridCellQuery = `
        DECLARE $id AS UTF8;
        DECLARE $gridX AS UINT32;
        DECLARE $gridY AS UINT32;
        
        UPSERT INTO GridCells (x, y, owner_id) VALUES ($gridX, $gridY, $id);
    `;
    const updatePlayerStateQuery = `
        DECLARE $id AS UTF8;
        DECLARE $state AS UTF8;
        
        UPDATE Users SET state = $state, cells_count = CAST(cells_count + 1 AS UINT32) WHERE id = $id;
    `;
    const decreaseCellsCount = `
        DECLARE $id AS UTF8;
        
        UPDATE Users SET cells_count = CAST(cells_count - 1 AS UINT32) WHERE id = $id;
    `;

    for (const message of event.messages) {
        const capturingMessage: CapturingMessage = JSON.parse(message.details.message.body);
        const player = await User.findById(dbSess, capturingMessage.playerId);

        if (!player) {
            logger.error(`Unable to find player ${capturingMessage.playerId} in DB`);
        } else {
            const coordsAreSame = player.gridX === capturingMessage.gridX && player.gridY === capturingMessage.gridY;

            if (coordsAreSame) {
                const gridCell = await GridCell.findByCoords(dbSess, capturingMessage.gridX, capturingMessage.gridY);

                if (gridCell) {
                    await executeQuery(dbSess, decreaseCellsCount, {
                        $id: TypedValues.utf8(gridCell.ownerId),
                    });
                }

                await executeQuery(dbSess, captureGridCellQuery, {
                    $id: TypedValues.utf8(player.id),
                    $gridX: TypedValues.uint32(capturingMessage.gridX),
                    $gridY: TypedValues.uint32(capturingMessage.gridY),
                });

                player.state = UserState.DEFAULT;

                await executeQuery(dbSess, updatePlayerStateQuery, {
                    $id: player.getTypedValue('id'),
                    $state: player.getTypedValue('state'),
                });

                await notifyStateChange('capture', [capturingMessage.gridX, capturingMessage.gridY]);
            } else {
                logger.info(`Coords of player ${player.id} was changed, do not capture cell`);
            }
        }
    }

    return functionResponse({});
});
