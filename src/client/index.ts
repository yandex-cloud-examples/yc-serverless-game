import { configure } from 'mobx';
import { defaultLogger } from '../common/logger';
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
    .then(() => defaultLogger.log('Serverless game successfully initialized'))
    .catch((error) => defaultLogger.log(`Serverless game failed to initialize: ${error}`));
