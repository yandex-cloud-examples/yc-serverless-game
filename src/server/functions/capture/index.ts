import { Handler } from '@yandex-cloud/function-types';
import { TypedValues } from 'ydb-sdk';
import { functionResponse } from '../../utils/function-response';
import { CapturingMessage, UserState } from '../../../common/types';
import { withDb } from '../../db/with-db';
import { User } from '../../db/entity/user';
import { logger } from '../../../common/logger';

export const handler = withDb<Handler.MessageQueue>(async (dbSess, event, context) => {
    const playerQuery = await dbSess.prepareQuery(`
        DECLARE $id AS UTF8;
        
        SELECT * FROM Users WHERE id = $id LIMIT 1;
    `);
    const captureGridCellQuery = await dbSess.prepareQuery(`
        DECLARE $id AS UTF8;
        DECLARE $gridX as UINT32;
        DECLARE $gridY as UINT32;
        
        UPSERT INTO GridCells (x, y, owner_id) VALUES ($gridX, $gridY, $id);
    `);
    const updatePlayerStateQuery = await dbSess.prepareQuery(`
        DECLARE $id as UTF8;
        DECLARE $state as UTF8;
        
        UPDATE Users SET state = $state WHERE id = $id;
    `);

    for (const message of event.messages) {
        const capturingMessage: CapturingMessage = JSON.parse(message.details.message.body);

        const { resultSets } = await dbSess.executeQuery(playerQuery, {
            $id: TypedValues.utf8(capturingMessage.playerId),
        });
        const users = User.fromResultSet(resultSets[0]);
        const player = users.find((u) => u.id === capturingMessage.playerId);

        if (!player) {
            logger.error(`Unable to find player ${capturingMessage.playerId} in DB`);
        } else {
            const coordsAreSame = player.gridX === capturingMessage.gridX && player.gridY === capturingMessage.gridY;

            if (coordsAreSame) {
                await dbSess.executeQuery(captureGridCellQuery, {
                    $id: TypedValues.utf8(player.id),
                    $gridX: TypedValues.uint32(capturingMessage.gridX),
                    $gridY: TypedValues.uint32(capturingMessage.gridY),
                });

                player.state = UserState.DEFAULT;

                await dbSess.executeQuery(updatePlayerStateQuery, {
                    $id: player.getTypedValue('id'),
                    $state: player.getTypedValue('state'),
                });
            } else {
                logger.info(`Coords of player ${player.id} was changed, do not capture cell`);
            }
        }
    }

    return functionResponse({});
});
