import { Handler } from '@yandex-cloud/function-types';
import { withDb } from '../../db/with-db';
import { functionResponse } from '../../utils/function-response';
import { updateLastActive } from '../../utils/update-last-active';
import { ServerStateBuilder } from '../../utils/server-state-builder';
import { probablyCall } from '../../utils/probably-call';

export const handler = withDb<Handler.Http>(async (dbSess, event, context) => {
    const meId: string = event.requestContext.authorizer?.userId;
    const withStats = Boolean(event.queryStringParameters.withStats);
    const stateBuilder = await ServerStateBuilder.create(dbSess);
    const serverState = stateBuilder.buildState(meId, withStats);

    // Do not update lastActive in every `get-state` in order to avoid overhead
    await probablyCall(0.2, () => updateLastActive(meId, dbSess));

    return functionResponse(serverState);
});
