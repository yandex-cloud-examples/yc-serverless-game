import {
    withTypeOptions, snakeToCamelCaseConversion, declareType, Types,
} from 'ydb-sdk';
import { Entity } from './entity';
import { NetworkTransport } from '../../../common/types';

interface IConfigData {
    name: string;
    gridCellSize: number;
    playerSize: number;
    worldSizeX: number;
    worldSizeY: number;
    maxInactiveSec: number;
    maxActivePlayers: number;
    transport: NetworkTransport;
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

    @declareType(Types.UINT32)
    public maxInactiveSec: number;

    @declareType(Types.UINT8)
    public maxActivePlayers: number;

    @declareType(Types.UTF8)
    public transport: NetworkTransport;

    constructor(data: IConfigData) {
        super(data);

        this.name = data.name;
        this.worldSizeX = data.worldSizeX;
        this.worldSizeY = data.worldSizeY;
        this.playerSize = data.playerSize;
        this.gridCellSize = data.gridCellSize;
        this.maxInactiveSec = data.maxInactiveSec;
        this.maxActivePlayers = data.maxActivePlayers;
        this.transport = data.transport;
    }
}
