import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types, Session, TypedValues,
} from 'ydb-sdk';
import { Entity } from './entity';
import { UserState } from '../../../common/types';
import { executeQuery } from '../execute-query';

interface IUserData {
    id: string;
    lastActive: Date;
    tgUserId: string;
    tgAvatar?: string;
    tgUsername: string;
    color: string;
    gridX: number;
    gridY: number;
    state: UserState;
    imageType: number;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class User extends Entity {
    @declareType(Types.UTF8)
    public id: string;

    @declareType(Types.TIMESTAMP)
    public lastActive: Date;

    @declareType(Types.UTF8)
    public tgUserId: string;

    @declareType(Types.optional(Types.UTF8))
    public tgAvatar?: string;

    @declareType(Types.UTF8)
    public tgUsername: string;

    @declareType(Types.UTF8)
    public color: string;

    @declareType(Types.UINT32)
    public gridX: number;

    @declareType(Types.UINT32)
    public gridY: number;

    @declareType(Types.UTF8)
    public state: UserState;

    @declareType(Types.UINT8)
    public imageType: number;

    constructor(data: IUserData) {
        super(data);

        this.id = data.id;
        this.lastActive = data.lastActive;
        this.tgUserId = data.tgUserId;
        this.tgAvatar = data.tgAvatar;
        this.tgUsername = data.tgUsername;
        this.color = data.color;
        this.gridX = data.gridX;
        this.gridY = data.gridY;
        this.state = data.state;
        this.imageType = data.imageType;
    }

    static async findById(dbSess: Session, id: string): Promise<User | undefined> {
        const query = `
            DECLARE $id AS UTF8;
            SELECT * FROM Users WHERE id = $id LIMIT 1;
        `;
        const { resultSets } = await executeQuery(dbSess, query, {
            $id: TypedValues.utf8(id),
        });
        const users = this.fromResultSet(resultSets[0]);

        return users[0];
    }

    static async all(dbSess: Session): Promise<User[]> {
        const { resultSets } = await executeQuery(dbSess, 'SELECT * FROM Users');

        return this.fromResultSet(resultSets[0]);
    }
}