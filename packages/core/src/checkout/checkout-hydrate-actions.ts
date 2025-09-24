import { Action } from '@bigcommerce/data-store';

import CheckoutInitialState from './checkout-initial-state';

export enum CheckoutHydrateActionType {
    HydrateInitialState = 'HYDRATE_INITIAL_STATE',
}

export interface CheckoutHydrateAction extends Action<CheckoutInitialState> {
    type: CheckoutHydrateActionType.HydrateInitialState;
}
