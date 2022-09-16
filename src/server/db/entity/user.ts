import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types, Session, TypedValues,
} from 'ydb-sdk';
import { Entity } from './entity';
import { UserState } from '../../../common/types';
import { executeQuery } from '../execute-query';
import { GridCell } from './grid-cell';
import { SCORE_FOR_CELL } from '../../utils/constants';

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
    wsConnectionId?: string;
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

    @declareType(Types.UTF8)
    public wsConnectionId?: string;

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
        this.wsConnectionId = data.wsConnectionId;
    }

    // TODO: extract owned cells number from DB
    calculateScore(gridCells: GridCell[]): number {
        return gridCells.filter((c) => c.ownerId === this.id).length * SCORE_FOR_CELL;
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

    static async findByGridPos(dbSess: Session, gridX: number, gridY: number): Promise<User | undefined> {
        const query = `
            DECLARE $gridX AS UINT32;
            DECLARE $gridY AS UINT32;
            SELECT * FROM Users WHERE grid_x = $gridX AND grid_y = $gridY LIMIT 1;
        `;

        const { resultSets } = await executeQuery(dbSess, query, {
            $gridX: TypedValues.uint32(gridX),
            $gridY: TypedValues.uint32(gridY),
        });
        const users = this.fromResultSet(resultSets[0]);

        return users[0];
    }

    static async all(dbSess: Session): Promise<User[]> {
        const { resultSets } = await executeQuery(dbSess, 'SELECT * FROM Users');

        return this.fromResultSet(resultSets[0]);
    }

    static async allWithWsConnection(dbSess: Session): Promise<User[]> {
        const { resultSets } = await executeQuery(dbSess, 'SELECT * FROM Users WHERE ws_connection_id IS NOT NULL');

        return this.fromResultSet(resultSets[0]);
    }
}
