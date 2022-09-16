// calls function with given chance, in other cases no-op
export const probablyCall = <F extends (...args: unknown[]) => R, R>(probability: number, fn: F): R | undefined => {
    if (Math.random() <= probability) {
        return fn();
    }

    return undefined;
};
