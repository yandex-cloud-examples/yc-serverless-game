import Logger from 'js-logger';

const level = process.env.DEBUG ? Logger.TRACE : Logger.INFO;

Logger.useDefaults();
Logger.setLevel(level);

export const logger = Logger.get('global');
export const createLogger = Logger.get;
