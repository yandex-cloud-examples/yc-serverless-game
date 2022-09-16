import { bind } from 'bind-decorator';
import { WsClient } from '../api/ws-client';
import { GameState } from './game-state';
import { ServerState } from '../../common/types';
import { logger } from '../../common/logger';

export class GameStateUpdater {
    private lastUpdateTime = 0;

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

        if (newState.time > this.lastUpdateTime) {
            this.lastUpdateTime = newState.time;

            this.gameState.update(newState);

            logger.debug('Update state. Time > lastUpdateTime');
        } else {
            logger.debug('Skip state update. Time <= lastUpdateTime');
        }
    }
}
