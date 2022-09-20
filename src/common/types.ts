export interface GameConfig {
    worldGridSize: [number, number];
    gridCellSize: number;
    playerSize: number;
    maxInactiveSec: number;
    maxActivePlayers: number;
    transport: NetworkTransport;
}

export interface GridCellState {
    ownerColor: string;
}

export const enum UserState {
    CAPTURING = 'capturing',
    DEFAULT = 'default',
}

export interface PlayerState {
    id: string;
    name: string;
    avatar?: string;
    color: string;
    state: UserState;
    gridX: number;
    gridY: number;
    score: number;
    imageType: number;
}

export interface Stats {
    topPlayers?: PlayerState[]
}

export interface ServerState {
    grid: Record<number, Record<number, GridCellState>>;
    me: PlayerState;
    players: PlayerState[];
    stats: Stats;
    time: number;
}

export interface CapturingMessage {
    playerId: string;
    gridX: number;
    gridY: number;
}

export type NetworkTransport = 'http' | 'ws';
