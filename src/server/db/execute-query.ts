import { Session, Ydb, ExecuteQuerySettings } from 'ydb-sdk';

interface IQueryParams {
    [k: string]: Ydb.ITypedValue;
}

const querySettings = new ExecuteQuerySettings()
    .withKeepInCache(true);

export const executeQuery = async (dbSess: Session, queryStr: string, queryParams?: IQueryParams) => {
    return dbSess.executeQuery(queryStr, queryParams, undefined, querySettings);
};
