import { ServerState } from '../types';

interface GenericMessage<T extends string, P> {
    type: T;
    payload: P;
}

interface MoveRequestPayload {
    gridX: number;
    gridY: number;
}

export type MoveRequestMessage = GenericMessage<'move-request', MoveRequestPayload>;
export type StateUpdateMessage = GenericMessage<'state-update', ServerState>;

export type ServerMessage = StateUpdateMessage;
export type ClientMessage = MoveRequestMessage;
