import { createDataStore } from '@bigcommerce/data-store';

import { createRequestErrorFactory } from '../common/error';

import CheckoutStore, { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import createActionTransformer from './create-action-transformer';
import createCheckoutStoreReducer from './create-checkout-store-reducer';
import { createInternalCheckoutSelectorsFactory } from './create-internal-checkout-selectors';

export default function createCheckoutStore(
    initialState: Partial<CheckoutStoreState> = {},
    options?: CheckoutStoreOptions
): CheckoutStore {
    const actionTransformer = createActionTransformer(createRequestErrorFactory());
    const createInternalCheckoutSelectors = createInternalCheckoutSelectorsFactory();
    const stateTransformer = (state: CheckoutStoreState) => createInternalCheckoutSelectors(state);

    return createDataStore(
        createCheckoutStoreReducer(),
        initialState,
        { actionTransformer, stateTransformer, ...options }
    );
}
