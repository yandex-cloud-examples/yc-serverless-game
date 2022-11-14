import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types, Session, TypedValues,
} from 'ydb-sdk';
import { Entity } from './entity';
import { executeQuery } from '../execute-query';

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
        const LIMIT = 1000;
        const result: GridCell[] = [];

        let lastX = -1;
        let lastY = -1;
        let hasMore = true;

        while (hasMore) {
            const { resultSets } = await executeQuery(dbSess, `
                DECLARE $limit AS Uint32;
                DECLARE $lastX AS Int64;
                DECLARE $lastY AS Int64;
                
                SELECT * FROM GridCells WHERE x > $lastX OR (x == $lastX AND y > $lastY) ORDER BY x, y LIMIT $limit;
            `, {
                $limit: TypedValues.uint32(LIMIT),
                $lastX: TypedValues.int64(lastX),
                $lastY: TypedValues.int64(lastY),
            });

            const gridCells = this.fromResultSet(resultSets[0]);

            if (gridCells.length > 0) {
                const lastGridCell = gridCells[gridCells.length - 1];

                lastX = lastGridCell.x;
                lastY = lastGridCell.y;

                result.push(...gridCells);
            } else {
                hasMore = false;
            }
        }

        return result;
    }
}
