import { BillingAddressActionTypes } from '../billing/billing-address-actions';
import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { CouponActionType } from '../coupon/coupon-actions';
import { GiftCertificateActionType } from '../coupon/gift-certificate-actions';
import { ConsignmentActionTypes } from '../shipping';

import cartReducer from './cart-reducer';
import { getCart } from './carts.mock';

describe('cartReducer()', () => {
    let initialState;

    beforeEach(() => {
        initialState = {
            data: getCart(),
        };
    });

    it('returns new data when checkout is loaded', () => {
        const action = {
            type: CheckoutActionType.LoadCheckoutSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when a consignment is updated', () => {
        const action = {
            type: ConsignmentActionTypes.UpdateConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when consignments are created', () => {
        const action = {
            type: ConsignmentActionTypes.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when billing address gets updated', () => {
        const action = {
            type: BillingAddressActionTypes.UpdateBillingAddressSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when coupon gets applied', () => {
        const action = {
            type: CouponActionType.ApplyCouponSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when coupon gets removed', () => {
        const action = {
            type: CouponActionType.RemoveCouponSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when gift certificate gets applied', () => {
        const action = {
            type: GiftCertificateActionType.ApplyGiftCertificateSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when gift certificate gets removed', () => {
        const action = {
            type: GiftCertificateActionType.RemoveGiftCertificateSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });
});
