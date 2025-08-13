import { createDataStore } from '@bigcommerce/data-store';

import { createRequestErrorFactory } from '../common/error';

import { CheckoutHydrateActionType } from './checkout-hydrate-actions';
import CheckoutInitialState from './checkout-initial-state';
import CheckoutStore, { CheckoutStoreOptions } from './checkout-store';
import CheckoutStoreState from './checkout-store-state';
import createActionTransformer from './create-action-transformer';
import createCheckoutStoreReducer from './create-checkout-store-reducer';
import { createInternalCheckoutSelectorsFactory } from './create-internal-checkout-selectors';

export default function createCheckoutStore(
    initialStoreState: Partial<CheckoutStoreState> = {},
    initialServerState?: CheckoutInitialState,
    options?: CheckoutStoreOptions,
): CheckoutStore {
    const actionTransformer = createActionTransformer(createRequestErrorFactory());
    const createInternalCheckoutSelectors = createInternalCheckoutSelectorsFactory();
    const stateTransformer = (state: CheckoutStoreState) => createInternalCheckoutSelectors(state);
    const reducer = createCheckoutStoreReducer();
    const hydrateAction = {
        type: CheckoutHydrateActionType.HydrateInitialState,
        payload: initialServerState,
    };

    return createDataStore(
        reducer,
        reducer(initialStoreState as CheckoutStoreState, hydrateAction),
        {
            actionTransformer,
            stateTransformer,
            ...options,
        },
    );
}
