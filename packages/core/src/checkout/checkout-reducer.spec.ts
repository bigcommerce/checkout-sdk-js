import { createAction } from '@bigcommerce/data-store';
import { omit } from 'lodash';

import { CheckoutActionType } from '../checkout';
import { getCheckout, getCheckoutState } from '../checkout/checkouts.mock';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { getSubmitOrderResponseBody } from '../order/internal-orders.mock';
import { OrderActionType } from '../order/order-actions';
import { ConsignmentActionType } from '../shipping';
import { SpamProtectionActionType } from '../spam-protection';

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
            data: omit(action.payload, [
                'billingAddress',
                'cart',
                'customer',
                'consignments',
                'coupons',
                'giftCertificates',
            ]),
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
        const action = createAction(
            CheckoutActionType.LoadCheckoutFailed,
            new RequestError(getErrorResponse()),
        );
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
            data: omit(action.payload, [
                'billingAddress',
                'cart',
                'customer',
                'consignments',
                'coupons',
                'giftCertificates',
            ]),
            errors: { updateError: undefined },
            statuses: { isUpdating: false },
        });
    });

    it('removes checkout data when checkout is deleted', () => {
        const stateWithData = getCheckoutState();

        expect(stateWithData.data).toBeDefined();

        const action = createAction(CheckoutActionType.DeleteCheckoutSucceeded);
        const output = checkoutReducer(stateWithData, action);

        expect(output.data).toBeUndefined();
    });

    it('returns new state when consignment gets created', () => {
        const action = createAction(
            ConsignmentActionType.CreateConsignmentsSucceeded,
            getCheckout(),
            { id: '123' },
        );
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                data: omit(action.payload, [
                    'billingAddress',
                    'cart',
                    'customer',
                    'consignments',
                    'coupons',
                    'giftCertificates',
                ]),
            }),
        );
    });

    it('returns new state when consignment gets updated', () => {
        const action = createAction(
            ConsignmentActionType.UpdateConsignmentSucceeded,
            getCheckout(),
            { id: '123' },
        );
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                data: omit(action.payload, [
                    'billingAddress',
                    'cart',
                    'customer',
                    'consignments',
                    'coupons',
                    'giftCertificates',
                ]),
            }),
        );
    });

    it('returns new state when Load Shipping options succeeded', () => {
        const action = createAction(
            ConsignmentActionType.LoadShippingOptionsSucceeded,
            getCheckout(),
        );
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                data: omit(action.payload, [
                    'billingAddress',
                    'cart',
                    'customer',
                    'consignments',
                    'coupons',
                    'giftCertificates',
                ]),
            }),
        );
    });

    it('returns new state when consignment gets deleted', () => {
        const action = createAction(
            ConsignmentActionType.DeleteConsignmentSucceeded,
            getCheckout(),
            { id: '123' },
        );
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                data: omit(action.payload, [
                    'billingAddress',
                    'cart',
                    'customer',
                    'consignments',
                    'coupons',
                    'giftCertificates',
                ]),
            }),
        );
    });

    it('returns new state when shipping option gets updated', () => {
        const action = createAction(
            ConsignmentActionType.UpdateShippingOptionSucceeded,
            getCheckout(),
            { id: '123' },
        );
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                data: omit(action.payload, [
                    'billingAddress',
                    'cart',
                    'customer',
                    'consignments',
                    'coupons',
                    'giftCertificates',
                ]),
            }),
        );
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
        const action = createAction(
            CheckoutActionType.UpdateCheckoutFailed,
            new RequestError(getErrorResponse()),
        );
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual({
            errors: { updateError: action.payload },
            statuses: { isUpdating: false },
        });
    });

    it('updates cart version from action meta when order creation reports a new version', () => {
        const stateWithData = getCheckoutState();
        const payload = getSubmitOrderResponseBody().data;
        const newVersion = (stateWithData.data?.version ?? 0) + 1;
        const action = createAction(OrderActionType.SubmitOrderSucceeded, payload, {
            version: newVersion,
        });
        const output = checkoutReducer(stateWithData, action);

        expect(output.data?.version).toBe(newVersion);
        expect(output.data?.orderId).toBe(payload.order.orderId);
    });

    it('keeps existing cart version when order creation action meta omits version', () => {
        const stateWithData = getCheckoutState();
        const payload = getSubmitOrderResponseBody().data;
        const action = createAction(OrderActionType.SubmitOrderSucceeded, payload);
        const output = checkoutReducer(stateWithData, action);

        expect(output.data?.version).toBe(stateWithData.data?.version);
    });

    it('returns new status when spam check is executing', () => {
        const action = createAction(SpamProtectionActionType.ExecuteRequested);
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                statuses: { isExecutingSpamCheck: true },
            }),
        );
    });

    it('returns new status when spam check is executed successfully', () => {
        const action = createAction(SpamProtectionActionType.ExecuteSucceeded);
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                statuses: { isExecutingSpamCheck: false },
            }),
        );
    });

    it('returns new status when spam check is failed to execute', () => {
        const action = createAction(SpamProtectionActionType.ExecuteFailed);
        const output = checkoutReducer(initialState, action);

        expect(output).toEqual(
            expect.objectContaining({
                statuses: { isExecutingSpamCheck: false },
            }),
        );
    });
});
