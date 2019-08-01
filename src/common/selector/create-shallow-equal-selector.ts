import { createSelectorCreator, defaultMemoize } from 'reselect';
import * as shallowEqual from 'shallowequal';

import withMemoizedCombiner from './with-memoized-combiner';

const createShallowEqualSelector = createSelectorCreator(
    defaultMemoize,
    (a: any, b: any) => shallowEqual(a, b)
);

export default withMemoizedCombiner(createShallowEqualSelector);
