import { Action, DataStore } from '@bigcommerce/data-store';

import HeadlessButtonSelectors from './headless-button-selectors';
import HeadlessButtonStoreState from './headless-button-store-state';

type HeadlessButtonStore = DataStore<HeadlessButtonStoreState, Action, HeadlessButtonSelectors>;

export default HeadlessButtonStore;
