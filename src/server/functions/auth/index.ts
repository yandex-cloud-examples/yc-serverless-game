import { AuthorizerHandler } from '@yandex-cloud/function-types';
import { TypedValues } from 'ydb-sdk';
import { withDb } from '../../db/with-db';
import { AUTH_COOKIE_NAME } from '../../utils/constants';
import { getAuthHash, pickAuthParameters } from '../../utils/tg-auth';
import { User } from '../../db/entity/user';
import { defaultLogger } from '../../../common/logger';

export const handler = withDb<AuthorizerHandler>(async (dbSess, event, context) => {
    const authResult: ReturnType<AuthorizerHandler> = {
        isAuthorized: false,
        context: {},
    };

    const authCookie = event.cookies[AUTH_COOKIE_NAME];

    if (authCookie) {
        try {
            const authCookieParsed = JSON.parse(authCookie);
            const authParams = pickAuthParameters(authCookieParsed);
            const checkHash = await getAuthHash(authParams);

            if (checkHash === authParams.hash) {
                const userQuery = await dbSess.prepareQuery(`
                    DECLARE $tgUserId as UTF8;
                    SELECT * FROM Users WHERE tg_user_id == $tgUserId LIMIT 1;
                `);
                const { resultSets } = await dbSess.executeQuery(userQuery, {
                    $tgUserId: TypedValues.utf8(authParams.id),
                });
                const users = User.fromResultSet(resultSets[0]);

                if (users.length === 1) {
                    authResult.isAuthorized = true;
                    authResult.context = {
                        userId: users[0].id,
                    };
                }
            }
        } catch (error) {
            defaultLogger.error(`Error parsing auth cookie: ${error}`);
        }
    }

    return authResult;
});
