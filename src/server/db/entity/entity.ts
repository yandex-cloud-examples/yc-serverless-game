import { TypedData, Ydb, Session } from 'ydb-sdk';

type StaticEntity<E extends Entity, CA extends unknown[]> = typeof Entity & { new (...args: CA): E };

export abstract class Entity extends TypedData {
    static fromResultSet<E extends Entity, CA extends unknown[]>(this: StaticEntity<E, CA>, resultSet: Ydb.IResultSet): E[] {
        return this.createNativeObjects(resultSet) as unknown as E[];
    }
}
