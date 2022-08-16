import * as uuid from 'uuid';
import { User } from '../../models/user';
import { withDb } from '../../db/with-db';

export const handler = withDb(async (dbSess, event, context) => {
    const newUser = new User({
        id: uuid.v4(),
        lastActive: new Date(),
        tgUserId: 'test-tg-login',
        color: Math.round(0xFF_FF_FF * Math.random()).toString(16),
    });

    await dbSess.bulkUpsert('Users', newUser.asTypedValue());

    return {
        statusCode: 200,
        body: 'login success',
    };
});
