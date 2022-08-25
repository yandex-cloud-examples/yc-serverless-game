export interface GameConfig {
    worldGridSize: [number, number];
    gridCellSize: number;
    playerSize: number;
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
    avatar: string;
    color: string;
    scores: number;
    state: UserState;
    gridX: number;
    gridY: number;
}

export interface ServerState {
    grid: Record<number, Record<number, GridCellState>>;
    me: PlayerState;
    players: PlayerState[];
    gameConfig: GameConfig;
}
