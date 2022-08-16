import { User } from '../../models/user';
import { withDb } from '../../db/with-db';

export const handler = withDb(async (dbSess, event, context) => {
    const { resultSets } = await dbSess.executeQuery('SELECT * FROM Users');
    const users = User.fromResultSet<User>(resultSets[0]);

    return {
        statusCode: 200,
        body: JSON.stringify(users),
    };
});
