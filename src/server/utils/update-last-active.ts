import { Session, TypedValues } from 'ydb-sdk';

export const updateLastActive = async (userId: string, dbSess: Session) => {
    const updateLastActiveQuery = await dbSess.prepareQuery(`
        DECLARE $lastActive AS TIMESTAMP;
        DECLARE $id AS UTF8;
        UPDATE Users SET last_active = $lastActive WHERE id = $id;
    `);

    await dbSess.executeQuery(updateLastActiveQuery, {
        $id: TypedValues.utf8(userId),
        $lastActive: TypedValues.timestamp(new Date()),
    });
};
