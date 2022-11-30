import { RectCoords, ServerState } from '../types';

interface GenericMessage<T extends string, P, M = unknown> {
    type: T;
    payload: P;
    meta?: M;
}

interface MoveRequestPayload {
    gridX: number;
    gridY: number;
    fov: RectCoords
}

export type MoveRequestMessage = GenericMessage<'move-request', MoveRequestPayload>;
export type StateUpdateMessage = GenericMessage<'state-update', ServerState, { updateSources: string[] }>;
export type MoveResponseMessage = GenericMessage<'move-response', ServerState>;

export type ServerMessage = StateUpdateMessage | MoveResponseMessage;
export type ClientMessage = MoveRequestMessage;
