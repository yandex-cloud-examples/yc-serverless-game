import { Handler } from '@yandex-cloud/function-types';
import { Driver, MetadataAuthService, Session } from 'ydb-sdk';
import { getEnv } from '../utils/get-env';

const YDB_DRIVER_CONNECT_TIMEOUT = Number.parseInt(getEnv('YDB_DRIVER_CONNECT_TIMEOUT', '2000'), 10);
const YDB_ENDPOINT = getEnv('YDB_ENDPOINT');
const YDB_DB = getEnv('YDB_DB');

export type HandlerWithDb = Handler extends (...args: infer U) => infer R ? (dbSess: Session, ...args: U) => R : never;

export const withDb = (handlerWithDb: HandlerWithDb): Handler => {
    return async (event, context) => {
        const driver = new Driver({
            endpoint: YDB_ENDPOINT,
            database: YDB_DB,
            authService: new MetadataAuthService(),
        });

        if (!await driver.ready(YDB_DRIVER_CONNECT_TIMEOUT)) {
            throw new Error(`YDB driver has not become ready in ${YDB_DRIVER_CONNECT_TIMEOUT}ms`);
        }

        try {
            return await driver.tableClient.withSession(async (session) => { return handlerWithDb(session, event, context); });
        } finally {
            await driver.destroy();
        }
    };
};
