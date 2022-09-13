import {
    Session, Ydb, ExecuteQuerySettings, withRetries, RetryParameters,
} from 'ydb-sdk';

interface IQueryParams {
    [k: string]: Ydb.ITypedValue;
}

const querySettings = new ExecuteQuerySettings()
    .withKeepInCache(true);
const retrySettings = new RetryParameters({
    maxRetries: 2,
});

export const executeQuery = async (dbSess: Session, queryStr: string, queryParams?: IQueryParams) => {
    return withRetries(() => {
        return dbSess.executeQuery(queryStr, queryParams, undefined, querySettings);
    }, retrySettings);
};
