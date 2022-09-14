export class ValueHolder<T> {
    private value: T | undefined;

    constructor(initialValue?: T) {
        this.value = initialValue;
    }

    hasValue(): boolean {
        return typeof this.value !== 'undefined';
    }

    get(): T {
        if (!this.hasValue()) {
            throw new Error('Value is not defined, call ValueHolder.set first');
        }

        return this.value!;
    }

    set(newValue: T) {
        if (this.hasValue()) {
            throw new Error('Value has been already set');
        }

        this.value = newValue;
    }
}
