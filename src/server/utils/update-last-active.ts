import { Session, TypedValues } from 'ydb-sdk';
import { executeQuery } from '../db/execute-query';

export const updateLastActive = async (userId: string, dbSess: Session) => {
    const updateLastActiveQuery = `
        DECLARE $lastActive AS TIMESTAMP;
        DECLARE $id AS UTF8;
        UPDATE Users SET last_active = $lastActive WHERE id = $id;
    `;

    await executeQuery(dbSess, updateLastActiveQuery, {
        $id: TypedValues.utf8(userId),
        $lastActive: TypedValues.timestamp(new Date()),
    });
};
