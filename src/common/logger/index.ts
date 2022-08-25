import log from 'loglevel';

export const logger = log.getLogger('default');

const level = (process.env.LOG_LEVEL || 'warn') as log.LogLevelDesc;

logger.setLevel(level);
