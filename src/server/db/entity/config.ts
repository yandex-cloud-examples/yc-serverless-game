import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types,
} from 'ydb-sdk';
import { Entity } from './entity';

interface IConfigData {
    name: string;
    gridCellSize: number;
    playerSize: number;
    worldSizeX: number;
    worldSizeY: number;
}

@withTypeOptions({ namesConversion: snakeToCamelCaseConversion })
export class Config extends Entity {
    @declareType(Types.UTF8)
    public name: string;

    @declareType(Types.UINT32)
    public worldSizeX: number;

    @declareType(Types.UINT32)
    public worldSizeY: number;

    @declareType(Types.UINT32)
    public playerSize: number;

    @declareType(Types.UINT32)
    public gridCellSize: number;

    constructor(data: IConfigData) {
        super(data);

        this.name = data.name;
        this.worldSizeX = data.worldSizeX;
        this.worldSizeY = data.worldSizeY;
        this.playerSize = data.playerSize;
        this.gridCellSize = data.gridCellSize;
    }
}
