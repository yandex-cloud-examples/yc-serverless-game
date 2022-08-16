import { TypedData, Ydb } from 'ydb-sdk';

export abstract class BaseModel extends TypedData {
    asTypedValue(): Ydb.TypedValue {
        return BaseModel.asTypedCollection([this]) as Ydb.TypedValue;
    }

    static fromResultSet<T extends BaseModel>(resultSet: Ydb.IResultSet): T[] {
        return this.createNativeObjects(resultSet) as unknown as T[];
    }
}
