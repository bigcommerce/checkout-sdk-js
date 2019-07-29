import { createAction } from '@bigcommerce/data-store';
import { omit } from 'lodash';

import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { ConsignmentActionType } from '../shipping';

import checkoutReducer from './checkout-reducer';
import CheckoutState from './checkout-state';

describe('checkoutReducer', () => {
    let initialState: CheckoutState;

    beforeEach(() => {
        initialState = { errors: {}, statuses: {} };
    });

    it('returns loaded state', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutSucceeded, getCheckout());
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual({
            data: omit(action.payload, ['billingAddress', 'cart', 'customer', 'consignments', 'coupons', 'giftCertificates']),
            errors: { loadError: undefined },
            statuses: { isLoading: false },
        });
    });

    it('returns loading state', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutRequested);
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual({
            errors: { loadError: undefined },
            statuses: { isLoading: true },
        });
    });

    it('returns error state', () => {
        const action = createAction(CheckoutActionType.LoadCheckoutFailed, new RequestError(getErrorResponse()));
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual({
            errors: { loadError: action.payload },
            statuses: { isLoading: false },
        });
    });

    it('returns updated state', () => {
        const action = createAction(CheckoutActionType.UpdateCheckoutSucceeded, getCheckout());
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual({
            data: omit(action.payload, ['billingAddress', 'cart', 'customer', 'consignments', 'coupons', 'giftCertificates']),
            errors: { updateError: undefined },
            statuses: { isUpdating: false },
        });
    });

    it('returns new state when consignment gets created', () => {
        const action = createAction(ConsignmentActionType.CreateConsignmentsSucceeded, getCheckout(), { id: '123' });
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(expect.objectContaining({
            data: omit(action.payload, ['billingAddress', 'cart', 'customer', 'consignments', 'coupons', 'giftCertificates']),
        }));
    });

    it('returns new state when consignment gets updated', () => {
        const action = createAction(ConsignmentActionType.UpdateConsignmentSucceeded, getCheckout(), { id: '123' });
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(expect.objectContaining({
            data: omit(action.payload, ['billingAddress', 'cart', 'customer', 'consignments', 'coupons', 'giftCertificates']),
        }));
    });

    it('returns new state when consignment gets deleted', () => {
        const action = createAction(ConsignmentActionType.DeleteConsignmentSucceeded, getCheckout(), { id: '123' });
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(expect.objectContaining({
            data: omit(action.payload, ['billingAddress', 'cart', 'customer', 'consignments', 'coupons', 'giftCertificates']),
        }));
    });

    it('returns new state when shipping option gets updated', () => {
        const action = createAction(ConsignmentActionType.UpdateShippingOptionSucceeded, getCheckout(), { id: '123' });
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(expect.objectContaining({
            data: omit(action.payload, ['billingAddress', 'cart', 'customer', 'consignments', 'coupons', 'giftCertificates']),
        }));
    });

    it('returns loading state', () => {
        const action = createAction(CheckoutActionType.UpdateCheckoutRequested);
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual({
            errors: { updateError: undefined },
            statuses: { isUpdating: true },
        });
    });

    it('returns error state', () => {
        const action = createAction(CheckoutActionType.UpdateCheckoutFailed, new RequestError(getErrorResponse()));
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual({
            errors: { updateError: action.payload },
            statuses: { isUpdating: false },
        });
    });
});
