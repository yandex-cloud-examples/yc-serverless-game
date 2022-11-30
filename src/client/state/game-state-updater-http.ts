import PageVisibility from 'visibilityjs';
import { bind } from 'bind-decorator';

import { GameState } from './game-state';
import { logger } from '../../common/logger';
import { ApiClient } from '../api';

const DEFAULT_POLL_DELAY_MS = 700;
const DEFAULT_ERRORS_COUNT_BEFORE_DELAY = 5;
const DEFAULT_POLL_DELAY_AFTER_ERRORS_MS = 4000;

enum PollingState {
    POLLING,
    STOPPED,
}

const delayPromise = (delayMs: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(resolve, delayMs);
    });
};

export class GameStateUpdaterHttp {
    private state: PollingState = PollingState.POLLING;
    private pollingErrorsCount = 0;
    private pollingInitialized = false;

    constructor(
        private readonly apiClient: ApiClient,
        private readonly gameState: GameState,
        private readonly pollDelay: number = DEFAULT_POLL_DELAY_MS,
        private readonly withStats: boolean = false,
    ) {
        PageVisibility.change(this.visibilityChangeHandler);

        this.initPolling();
    }

    start() {
        logger.debug('Start polling');

        this.state = PollingState.POLLING;
    }

    stop() {
        logger.debug('Stop polling');

        this.state = PollingState.STOPPED;
    }

    @bind
    private visibilityChangeHandler(event: Event, state: string) {
        switch (state) {
            case 'hidden':
                this.stop();
                break;

            case 'visible':
                this.start();
                break;

            default:
                logger.error(`Unknown visibility state: ${state}`);
        }
    }

    private async initPolling() {
        if (this.pollingInitialized) {
            throw new Error('Polling already initialized');
        }

        this.pollingInitialized = true;

        // eslint-disable-next-line no-constant-condition
        while (true) {
            if (this.state === PollingState.POLLING) {
                try {
                    // eslint-disable-next-line no-await-in-loop
                    const severState = await this.apiClient.getState(this.withStats);

                    logger.debug('Got new state from server', severState);

                    if (severState) {
                        this.gameState.update(severState);
                    }

                    this.pollingErrorsCount = 0;
                } catch (error) {
                    // eslint-disable-next-line no-await-in-loop
                    await this.handlePollError(error as Error);
                }
            }

            // eslint-disable-next-line no-await-in-loop
            await delayPromise(this.pollDelay);
        }
    }

    private async handlePollError(error: Error) {
        this.pollingErrorsCount++;

        if (this.pollingErrorsCount >= DEFAULT_ERRORS_COUNT_BEFORE_DELAY) {
            await delayPromise(DEFAULT_POLL_DELAY_AFTER_ERRORS_MS);

            this.pollingErrorsCount = 0;
        }

        logger.warn(`Error polling state: ${error}`);
    }
}
