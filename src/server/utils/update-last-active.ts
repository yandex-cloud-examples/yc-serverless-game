import { Session } from 'ydb-sdk';
import { User } from '../db/entity/user';

export const updateLastActive = async (user: User, dbSess: Session) => {
    // eslint-disable-next-line no-param-reassign
    user.lastActive = new Date();

    const updateLastActiveQuery = await dbSess.prepareQuery(`
        DECLARE $lastActive AS TIMESTAMP;
        DECLARE $id AS UTF8;
        UPDATE Users SET last_active = $lastActive WHERE id = $id;
    `);

    await dbSess.executeQuery(updateLastActiveQuery, {
        $id: user.getTypedValue('id'),
        $lastActive: user.getTypedValue('lastActive'),
    });
};
