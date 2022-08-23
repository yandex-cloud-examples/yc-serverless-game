import { FunctionHandler } from '@yandex-cloud/function-types';
import { User } from '../../db/entity/user';
import { withDb } from '../../db/with-db';
import { functionResponse } from '../../utils/function-response';

export const handler = withDb<FunctionHandler>(async (dbSess, event, context) => {
    const { resultSets } = await dbSess.executeQuery('SELECT * FROM Users');
    const users = User.fromResultSet(resultSets[0]);

    return functionResponse(users);
});
