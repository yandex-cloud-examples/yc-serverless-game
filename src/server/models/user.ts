import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types, Ydb,
} from 'ydb-sdk';
import { BaseModel } from './base';

interface IUserData {
    id: string;
    lastActive: Date;
    tgUserId: string;
    color: string;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class User extends BaseModel {
    @declareType(Types.UTF8)
    public id: string;

    @declareType(Types.TIMESTAMP)
    public lastActive: Date;

    @declareType(Types.UTF8)
    public tgUserId: string;

    @declareType(Types.UTF8)
    public color: string;

    constructor(data: IUserData) {
        super(data);

        this.id = data.id;
        this.lastActive = data.lastActive;
        this.tgUserId = data.tgUserId;
        this.color = data.color;
    }
}
