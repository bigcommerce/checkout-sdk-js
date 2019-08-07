import { createSelector as defaultSelectorCreator } from 'reselect';

import memoize from '../utility/memoize';

/**
 * Decorate selector creators with the ability to memoize the return value of
 * their combiner if it is a function (which effectively works as a partially
 * applied combiner).
 */
export default function withMemoizedCombiner<T extends typeof defaultSelectorCreator>(
    creator: T
): T {
    return ((...args: any[]) => {
        const combiner = args.pop();

        // Reselect's default `createSelector` has many overloads. To avoid having
        // to redefine all of them, we're using `any` to bypass the typechecker.
        return (creator as any)(...args, (...combinerArgs: any[]) => {
            // Although there are many overloads, all of them have the last argument
            // as the combiner.
            const result = combiner(...combinerArgs);

            if (typeof result === 'function') {
                return memoize(result);
            }

            return result;
        });
    }) as T;
}
