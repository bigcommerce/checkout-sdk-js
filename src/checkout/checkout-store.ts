import { DataStore, ReadableDataStore } from '@bigcommerce/data-store';

import InternalCheckoutSelectors from './internal-checkout-selectors';

type CheckoutStore = DataStore<InternalCheckoutSelectors>;

export default CheckoutStore;

export type ReadableCheckoutStore = ReadableDataStore<InternalCheckoutSelectors>;

export interface CheckoutStoreOptions {
    shouldWarnMutation?: boolean;
}
