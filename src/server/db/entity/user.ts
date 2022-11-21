import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types, Session, TypedValues, Ydb,
} from 'ydb-sdk';
import { Entity } from './entity';
import { Coords, UserState } from '../../../common/types';
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
    fovTlX?: number;
    fovTlY?: number;
    fovBrX?: number;
    fovBrY?: number;
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

    @declareType(Types.UINT32)
    public fovTlX?: number;

    @declareType(Types.UINT32)
    public fovTlY?: number;

    @declareType(Types.UINT32)
    public fovBrX?: number;

    @declareType(Types.UINT32)
    public fovBrY?: number;

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
        this.fovTlX = data.fovTlX;
        this.fovTlY = data.fovTlY;
        this.fovBrX = data.fovBrX;
        this.fovBrY = data.fovBrY;
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

    static async allWithFOVInCoordsAndWs(dbSess: Session, coords: Coords[]): Promise<User[]> {
        if (coords.length === 0) {
            return [];
        }

        const declareParts: string[] = [];
        const whereParts: string[] = [];
        const queryParams: Record<string, Ydb.ITypedValue> = {};

        for (const [i, c] of coords.entries()) {
            declareParts.push(
                `DECLARE $cX${i} AS UINT32;`,
                `DECLARE $cY${i} AS UINT32;`,
            );

            whereParts.push(
                `($cX${i} BETWEEN fov_tl_x AND fov_br_x AND $cY${i} BETWEEN fov_tl_y AND fov_br_y)`,
            );

            queryParams[`$cX${i}`] = TypedValues.uint32(c[0]);
            queryParams[`$cY${i}`] = TypedValues.uint32(c[1]);
        }

        const query = `
            ${declareParts.join('\n')}
            
            SELECT
                *
            FROM
                Users
            WHERE
                ws_connection_id IS NOT NULL AND
                (${whereParts.join(' OR ')})
        `;

        const { resultSets } = await executeQuery(dbSess, query, queryParams);

        return this.fromResultSet(resultSets[0]);
    }
}
