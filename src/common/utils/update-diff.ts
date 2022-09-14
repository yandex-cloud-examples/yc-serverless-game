import * as deepDiff from 'deep-diff';
import { logger } from '../logger';

export const updateDiff = <T>(target: T, source: T) => {
    const diff = deepDiff.diff(target, source);

    if (diff?.length) {
        for (const diffItem of diff) {
            deepDiff.applyChange(target, source, diffItem);
        }
    } else {
        logger.debug('There is no diff in target and source');
    }
};
