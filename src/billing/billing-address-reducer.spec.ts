import { createAction } from '@bigcommerce/data-store';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { OrderActionType } from '../order';
import { getOrder } from '../order/orders.mock';

import billingAddressReducer from './billing-address-reducer';
import BillingAddressState from './billing-address-state';

describe('billingAddressReducer', () => {
    let initialState: BillingAddressState;

    beforeEach(() => {
        initialState = { errors: {}, statuses: {} };
    });

    it('returns billing address when checkout loads', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout());
        const output = billingAddressReducer(initialState, action);

        expect(output).toEqual({
            data: action.payload && action.payload.billingAddress,
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns billing address when order loads', () => {
        const action = createAction(OrderActionType.LoadOrderSucceeded, getOrder());
        const output = billingAddressReducer(initialState, action);

        expect(output).toEqual({
            data: action.payload && action.payload.billingAddress,
            errors: {},
            statuses: {},
        });
    });

    it('returns loading state when checkout is requested', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutRequested);
        const output = billingAddressReducer(initialState, action);

        expect(output).toEqual({
            errors: { loadError: undefined },
            statuses: { isLoading: true },
        });
    });

    it('returns error state when checkout fails to load', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutFailed, new RequestError(getErrorResponse()));
        const output = billingAddressReducer(initialState, action);

        expect(output).toEqual({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });
});
