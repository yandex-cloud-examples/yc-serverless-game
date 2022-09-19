export class Channel<T> {
    private promise!: Promise<T>;
    private resolveFn!: (value: T) => void;
    private rejectFn!: () => void;

    private static DEFAULT_TIMEOUT_MS = 2000;

    constructor() {
        this.recreatePromise();
    }

    private recreatePromise() {
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
        });
    }

    send(value: T) {
        this.resolveFn(value);

        this.recreatePromise();
    }

    async receive(timeoutMs = Channel.DEFAULT_TIMEOUT_MS): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Timeout ${timeoutMs}ms reached`));
            }, timeoutMs);

            this.promise
                .then((value) => {
                    clearTimeout(timeout);

                    resolve(value);
                })
                .catch(reject);
        });
    }
}
