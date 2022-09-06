import { Handler } from '@yandex-cloud/function-types';
import { TypedValues } from 'ydb-sdk';

import { functionResponse } from '../../utils/function-response';
import { withDb } from '../../db/with-db';
import { executeQuery } from '../../db/execute-query';

export const handler = withDb<Handler.Http>(async (dbSess, event) => {
    // @ts-ignore TODO: add to @yandex-cloud/function-types
    const { connectionId } = event.requestContext;

    if (!connectionId) {
        return functionResponse('connectionId is missing in request context', 400);
    }

    const query = `
        DECLARE $connId AS UTF8;
        
        UPDATE Users SET ws_connection_id = NULL WHERE ws_connection_id = $connId;
    `;

    await executeQuery(dbSess, query, {
        $connId: TypedValues.utf8(connectionId),
    });

    return functionResponse({});
});
