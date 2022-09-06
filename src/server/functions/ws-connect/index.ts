import { Handler } from '@yandex-cloud/function-types';
import { TypedValues } from 'ydb-sdk';

import { functionResponse } from '../../utils/function-response';
import { withDb } from '../../db/with-db';
import { executeQuery } from '../../db/execute-query';

export const handler = withDb<Handler.Http>(async (dbSess, event) => {
    const userId = event.requestContext.authorizer?.userId;
    // @ts-ignore TODO: add to @yandex-cloud/function-types
    const { connectionId } = event.requestContext;

    if (!connectionId) {
        return functionResponse('connectionId is missing in request context', 400);
    }

    const query = `
        DECLARE $id AS UTF8;
        DECLARE $connId as UTF8;
        
        UPDATE Users SET ws_connection_id = $connId WHERE id = $id;
    `;

    await executeQuery(dbSess, query, {
        $id: TypedValues.utf8(userId),
        $connId: TypedValues.utf8(connectionId),
    });

    return functionResponse({});
});
