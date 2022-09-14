import { WebsocketBuilder, Websocket } from 'websocket-ts';
import { bind } from 'bind-decorator';
import { ApiClient } from './index';
import { HttpClient } from './http-client';
import { logger } from '../../common/logger';

const DEFAULT_URL = '/websocket';

// TODO: reconnect options
export class WsClient implements ApiClient {
    private readonly ws: Websocket;
    private readonly httpClient: HttpClient;

    constructor(httpClient: HttpClient, wsUrl: string = DEFAULT_URL) {
        const currentHost = window.location.host;
        const url = new URL(wsUrl, `wss://${currentHost}`);

        this.httpClient = httpClient;
        this.ws = new WebsocketBuilder(url.toString())
            .onError(this.onError)
            .onMessage(this.onMessage)
            .onOpen(this.onOpen)
            .build();
    }

    @bind
    private onError(ws: Websocket, event: Event) {
        logger.log(event);
    }

    @bind
    private onMessage(ws: Websocket, event: MessageEvent) {
        logger.log(event);
    }

    @bind
    private onOpen() {
        // do nothing
    }

    async moveTo(gridX: number, gridY: number) {
        await this.httpClient.moveTo(gridX, gridY);
    }

    async getConfig() {
        return this.httpClient.getConfig();
    }

    async getState(withStats = false) {
        return this.httpClient.getState(withStats);
    }
}
