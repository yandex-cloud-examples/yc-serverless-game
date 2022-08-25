import { configure } from 'mobx';
import { logger } from '../common/logger';
import { ServerlessGame } from './game';

import './styles/index.pcss';

configure({
    enforceActions: 'always',
    computedRequiresReaction: true,
    reactionRequiresObservable: true,
    observableRequiresReaction: true,
});

const serverlessGame = new ServerlessGame();

serverlessGame.init()
    .then(() => logger.log('Serverless game successfully initialized'))
    .catch((error) => logger.log(`Serverless game failed to initialize: ${error}`));
