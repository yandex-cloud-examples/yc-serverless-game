export class ValueHolder<T> {
    private value: T | undefined;

    constructor(initialValue?: T) {
        this.value = initialValue;
    }

    get(): T {
        if (!this.value) {
            throw new Error('Value is not defined, call ValueHolder.set first');
        }

        return this.value;
    }

    set(newValue: T) {
        if (this.value) {
            throw new Error('Value has been already set');
        }

        this.value = newValue;
    }
}
