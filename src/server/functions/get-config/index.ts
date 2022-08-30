import { Handler } from '@yandex-cloud/function-types';
import { withDb } from '../../db/with-db';
import { getGameConfig } from '../../utils/get-game-config';
import { functionResponse } from '../../utils/function-response';

export const handler = withDb<Handler.Http>(async (dbSess, event, context) => {
    const gameConfig = await getGameConfig(dbSess);

    return functionResponse(gameConfig);
});
