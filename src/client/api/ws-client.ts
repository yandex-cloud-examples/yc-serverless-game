import {
    WebsocketBuilder, Websocket, LinearBackoff, LRUBuffer,
} from 'websocket-ts';
import { Mutex } from 'async-mutex';
import { bind } from 'bind-decorator';
import { ApiClient } from './index';
import { HttpClient } from './http-client';
import { ServerState } from '../../common/types';
import { MoveRequestMessage, MoveResponseMessage, ServerMessage } from '../../common/ws/messages';
import { createLogger } from '../../common/logger';

const DEFAULT_URL = '/websocket';
const DEFAULT_WS_BACKOFF = new LinearBackoff(0, 1000, 5000);
const DEFAULT_WS_BUFFER = new LRUBuffer(5);
const logger = createLogger('WsClient');

type ServerStateListener = (newState: ServerState) => void;

class Channel<T> {
    private promise!: Promise<T>;
    private resolveFn!: (value: T) => void;
    private rejectFn!: () => void;

    private static DEFAULT_TIMEOUT_MS = 2000;

    constructor() {
        this.recreatePromise();
    }

    private recreatePromise() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
        });
    }

    send(value: T) {
        this.resolveFn(value);

        this.recreatePromise();
    }

    async receive(timeoutMs = Channel.DEFAULT_TIMEOUT_MS): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout ${timeoutMs}ms reached`));
            }, timeoutMs);

            this.promise
                .then((value) => {
                    clearTimeout(timeout);

                    resolve(value);
                })
                .catch(reject);
        });
    }
}

export class WsClient implements ApiClient {
    private readonly ws: Websocket;
    private readonly httpClient: HttpClient;
    private readonly stateUpdateMutex = new Mutex();
    private readonly moveResponseChannel = new Channel<MoveResponseMessage>();
    private readonly stateListeners: ServerStateListener[] = [];

    private lastUpdateTime = 0;

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

    private notifyStateListeners(state: ServerState) {
        if (this.stateUpdateMutex.isLocked()) {
            logger.debug('Do not notify listeners since update mutex is locked');

            return;
        }

        if (this.lastUpdateTime >= state.time) {
            logger.debug('Do not notify listeners since new state has old update time', this.lastUpdateTime, state.time);

            return;
        }

        this.lastUpdateTime = state.time;

        for (const l of this.stateListeners) {
            l(state);
        }
    }

    @bind
    private onMessage(ws: Websocket, event: MessageEvent) {
        const message: ServerMessage = JSON.parse(event.data);

        logger.debug('Got message from websocket', message);

        switch (message.type) {
            case 'state-update':
                this.notifyStateListeners(message.payload);
                break;

            case 'move-response':
                this.moveResponseChannel.send(message);
                break;

            default:
                logger.warn('Unknown WS message', message);
        }
    }

    async moveTo(gridX: number, gridY: number) {
        const moveRequest = [gridX, gridY];

        logger.debug('Received moveTo request, waiting for mutex', moveRequest);

        let moveResponse: MoveResponseMessage | undefined;

        await this.stateUpdateMutex.runExclusive(async () => {
            logger.debug('Mutex acquired, performing request to server', moveRequest);

            const message: MoveRequestMessage = {
                type: 'move-request',
                payload: {
                    gridX,
                    gridY,
                },
            };

            this.ws.send(JSON.stringify(message));

            try {
                logger.debug('Waiting for move response', moveRequest);

                moveResponse = await this.moveResponseChannel.receive();

                logger.debug('Received move response', moveResponse);
            } catch (error) {
                logger.warn('Unable to get move response', error);
            }
        });

        if (moveResponse) {
            this.notifyStateListeners(moveResponse.payload);
        }
    }

    async getConfig() {
        return this.httpClient.getConfig();
    }

    async getState(withStats = false) {
        return this.httpClient.getState(withStats);
    }
}
