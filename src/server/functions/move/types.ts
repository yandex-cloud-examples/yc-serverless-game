import { RectCoords } from '../../../common/types';

export interface MoveRequest {
    gridX: number;
    gridY: number;
    fov: RectCoords
}
