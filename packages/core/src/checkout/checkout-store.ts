import { Action, DataStore, ReadableDataStore } from '@bigcommerce/data-store';

import CheckoutStoreState from './checkout-store-state';
import InternalCheckoutSelectors from './internal-checkout-selectors';

type CheckoutStore = DataStore<CheckoutStoreState, Action, InternalCheckoutSelectors>;

export default CheckoutStore;

export type ReadableCheckoutStore = ReadableDataStore<InternalCheckoutSelectors>;

export interface CheckoutStoreOptions {
    shouldWarnMutation?: boolean;
}
