import { createSelectorCreator, defaultMemoize } from 'reselect';
import * as shallowEqual from 'shallowequal';

const createShallowEqualSelector = createSelectorCreator(
    defaultMemoize,
    (a: any, b: any) => shallowEqual(a, b)
);

export default createShallowEqualSelector;
