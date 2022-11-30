import { GameConfig, RectCoords, ServerState } from '../../common/types';

export interface ApiClient {
    moveTo(gridX: number, gridY: number, fov: RectCoords): Promise<void>;
    getConfig(): Promise<GameConfig>;
    getState(withStats?: boolean): Promise<ServerState | undefined>;
}
