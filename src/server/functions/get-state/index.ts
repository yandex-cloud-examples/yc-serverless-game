import { Handler } from '@yandex-cloud/function-types';
import { withDb } from '../../db/with-db';
import { functionResponse } from '../../utils/function-response';
import { updateLastActive } from '../../utils/update-last-active';
import { buildGameState } from '../../utils/build-game-state';

// calls function with given chance, in other cases no-op
const probablyCall = <F extends (...args: unknown[]) => R, R>(probability: number, fn: F): R | undefined => {
    if (Math.random() <= probability) {
        return fn();
    }

    return undefined;
};

export const handler = withDb<Handler.Http>(async (dbSess, event, context) => {
    const meId: string = event.requestContext.authorizer?.userId;
    const serverState = await buildGameState(meId, dbSess);

    // Do not update lastActive in every `get-state` in order to avoid overhead
    await probablyCall(0.2, () => updateLastActive(meId, dbSess));

    return functionResponse(serverState);
});
