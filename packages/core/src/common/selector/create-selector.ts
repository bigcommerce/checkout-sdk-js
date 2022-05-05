import { createSelector as defaultSelectorCreator } from 'reselect';

import withMemoizedCombiner from './with-memoized-combiner';

/**
 * This is a decorated version of Reselect's default `createSelector` function.
 * If the return value of the combiner function is a function, it will create a
 * memorized version of that function and return it instead.
 */
export default withMemoizedCombiner(defaultSelectorCreator);
