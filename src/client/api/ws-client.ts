import {
    WebsocketBuilder, Websocket, LinearBackoff, LRUBuffer,
} from 'websocket-ts';
import { bind } from 'bind-decorator';
import { ApiClient } from './index';
import { HttpClient } from './http-client';
import { ServerState } from '../../common/types';
import { MoveRequestMessage, ServerMessage } from '../../common/ws/messages';

const DEFAULT_URL = '/websocket';
const DEFAULT_WS_BACKOFF = new LinearBackoff(0, 1000, 5000);
const DEFAULT_WS_BUFFER = new LRUBuffer(5);

type ServerStateListener = (newState: ServerState) => void;

export class WsClient implements ApiClient {
    private readonly ws: Websocket;
    private readonly httpClient: HttpClient;

    private readonly stateListeners: ServerStateListener[] = [];

    constructor(httpClient: HttpClient, wsUrl: string = DEFAULT_URL) {
        const currentHost = window.location.host;
        const url = new URL(wsUrl, `wss://${currentHost}`);

        this.httpClient = httpClient;
        this.ws = new WebsocketBuilder(url.toString())
            .withBackoff(DEFAULT_WS_BACKOFF)
            .withBuffer(DEFAULT_WS_BUFFER)
            .onMessage(this.onMessage)
            .build();
    }

    onNewState(listener: ServerStateListener) {
        this.stateListeners.push(listener);
    }

    @bind
    private onMessage(ws: Websocket, event: MessageEvent) {
        const message: ServerMessage = JSON.parse(event.data);

        if (message.type === 'state-update') {
            for (const l of this.stateListeners) {
                l(message.payload);
            }
        }
    }

    async moveTo(gridX: number, gridY: number) {
        const message: MoveRequestMessage = {
            type: 'move-request',
            payload: {
                gridX,
                gridY,
            },
        };

        this.ws.send(JSON.stringify(message));
    }

    async getConfig() {
        return this.httpClient.getConfig();
    }

    async getState(withStats = false) {
        return this.httpClient.getState(withStats);
    }
}
