import { bind } from 'bind-decorator';
import { WsClient } from '../api/ws-client';
import { GameState } from './game-state';
import { ServerState } from '../../common/types';
import { createLogger } from '../../common/logger';

const logger = createLogger('GameStateUpdate');

export class GameStateUpdaterWs {
    constructor(
        private readonly wsClient: WsClient,
        private readonly gameState: GameState,
        private withStatus: boolean = false,
    ) {
        wsClient.onNewState(this.onNewState);
    }

    @bind
    onNewState(newState: ServerState) {
        logger.debug('Received new state', newState);

        this.gameState.update(newState);
    }
}
