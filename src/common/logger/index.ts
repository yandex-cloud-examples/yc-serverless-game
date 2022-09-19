import Logger from 'js-logger';

const level = process.env.DEBUG ? Logger.TRACE : Logger.WARN;

Logger.useDefaults();
Logger.setLevel(level);

export const logger = Logger.get('global');
export const createLogger = Logger.get;
