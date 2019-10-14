import { BillingAddressActionType } from '../billing';
import { CheckoutActionType } from '../checkout';
import { getCheckout } from '../checkout/checkouts.mock';
import { CouponActionType, GiftCertificateActionType } from '../coupon';
import { ConsignmentActionType } from '../shipping';

import cartReducer from './cart-reducer';
import CartState from './cart-state';
import { getCart, getCartState } from './carts.mock';

describe('cartReducer()', () => {
    let initialState: CartState;

    beforeEach(() => {
        initialState = getCartState();
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
            type: ConsignmentActionType.UpdateConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when consignments are created', () => {
        const action = {
            type: ConsignmentActionType.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when billing address gets updated', () => {
        const action = {
            type: BillingAddressActionType.UpdateBillingAddressSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when a consignment is updated', () => {
        const action = {
            type: ConsignmentActionType.UpdateConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when a consignment is created', () => {
        const action = {
            type: ConsignmentActionType.CreateConsignmentsSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when a consignment is deleted', () => {
        const action = {
            type: ConsignmentActionType.DeleteConsignmentSucceeded,
            payload: getCheckout(),
        };

        expect(cartReducer(initialState, action)).toEqual(expect.objectContaining({
            data: getCart(),
        }));
    });

    it('returns new data when a shipping option is updated', () => {
        const action = {
            type: ConsignmentActionType.UpdateShippingOptionSucceeded,
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
