import * as deepDiff from 'deep-diff';

export const hasDiff = <T>(target: T, source: T): boolean => {
    const diff = deepDiff.diff(target, source);

    return Boolean(diff && diff.length > 0);
};
