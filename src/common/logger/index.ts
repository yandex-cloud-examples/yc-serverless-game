export class Logger {
    log(msg: unknown) {
        // eslint-disable-next-line no-console
        console.log(msg);
    }

    error(msg: unknown) {
        // eslint-disable-next-line no-console
        console.error(msg);
    }
}

export const defaultLogger = new Logger();
