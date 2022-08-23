import { FunctionHandler, AuthorizerHandler } from '@yandex-cloud/function-types';
import { Driver, MetadataAuthService, Session } from 'ydb-sdk';
import { getEnv } from '../utils/get-env';

const YDB_DRIVER_CONNECT_TIMEOUT = Number.parseInt(getEnv('YDB_DRIVER_CONNECT_TIMEOUT', '2000'), 10);
const YDB_ENDPOINT = getEnv('YDB_ENDPOINT');
const YDB_DB = getEnv('YDB_DB');

let driver: Driver | undefined;

type Handler = FunctionHandler | AuthorizerHandler;

export type HandlerWithDb<H extends Handler> = H extends (...args: infer U) => infer R ? (dbSess: Session, ...args: U) => R : never;

export const withDb = <H extends Handler = FunctionHandler>(handlerWithDb: HandlerWithDb<H>): H => {
    // TODO: hard to understand typing error here
    // @ts-ignore
    const fn: H = async (event: any, context: any) => {
        if (!driver) {
            driver = new Driver({
                endpoint: YDB_ENDPOINT,
                database: YDB_DB,
                authService: new MetadataAuthService(),
            });

            if (!await driver.ready(YDB_DRIVER_CONNECT_TIMEOUT)) {
                throw new Error(`YDB driver has not become ready in ${YDB_DRIVER_CONNECT_TIMEOUT}ms`);
            }
        }

        return driver.tableClient.withSession(async (session) => { return handlerWithDb(session, event, context); });
    };

    return fn;
};
