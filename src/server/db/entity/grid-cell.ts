import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types, Session,
} from 'ydb-sdk';
import { Entity } from './entity';

interface IGridCellData {
    x: number;
    y: number;
    ownerId: string;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class GridCell extends Entity {
    @declareType(Types.UINT32)
    public x: number;

    @declareType(Types.UINT32)
    public y: number;

    @declareType(Types.UTF8)
    public ownerId: string;

    constructor(data: IGridCellData) {
        super(data);

        this.x = data.x;
        this.y = data.y;
        this.ownerId = data.ownerId;
    }

    static async all(dbSess: Session): Promise<GridCell[]> {
        const query = await dbSess.prepareQuery('SELECT * FROM GridCells');
        const { resultSets } = await dbSess.executeQuery(query);

        return this.fromResultSet(resultSets[0]);
    }
}
