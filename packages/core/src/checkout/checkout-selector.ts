import { memoizeOne } from '@bigcommerce/memoize';

import { BillingAddressSelector } from '../billing';
import { CartSelector } from '../cart';
import { MissingDataError, MissingDataErrorType } from '../common/error/errors';
import { createSelector } from '../common/selector';
import { guard } from '../common/utility';
import { CouponSelector, GiftCertificateSelector } from '../coupon';
import { CustomerSelector } from '../customer';
import { ConsignmentSelector } from '../shipping';

import Checkout from './checkout';
import CheckoutState, { DEFAULT_STATE } from './checkout-state';

export default interface CheckoutSelector {
    getCheckout(): Checkout | undefined;
    getCheckoutOrThrow(): Checkout;
    getOutstandingBalance(useStoreCredit?: boolean): number | undefined;
    getLoadError(): Error | undefined;
    getUpdateError(): Error | undefined;
    isExecutingSpamCheck(): boolean;
    isLoading(): boolean;
    isUpdating(): boolean;
}

export type CheckoutSelectorFactory = (
    state: CheckoutState,
    billingAddress: BillingAddressSelector,
    cart: CartSelector,
    consignments: ConsignmentSelector,
    coupons: CouponSelector,
    customer: CustomerSelector,
    giftCertificates: GiftCertificateSelector
) => CheckoutSelector;

interface CheckoutSelectorDependencies {
    billingAddress: BillingAddressSelector;
    cart: CartSelector;
    consignments: ConsignmentSelector;
    coupons: CouponSelector;
    customer: CustomerSelector;
    giftCertificates: GiftCertificateSelector;
}

export function createCheckoutSelectorFactory(): CheckoutSelectorFactory {
    const getCheckout = createSelector(
        (state: CheckoutState) => state.data,
        (_: CheckoutState, { billingAddress }: CheckoutSelectorDependencies) => billingAddress.getBillingAddress,
        (_: CheckoutState, { cart }: CheckoutSelectorDependencies) => cart.getCart,
        (_: CheckoutState, { customer }: CheckoutSelectorDependencies) => customer.getCustomer,
        (_: CheckoutState, { consignments }: CheckoutSelectorDependencies) => consignments.getConsignments,
        (_: CheckoutState, { coupons }: CheckoutSelectorDependencies) => coupons.getCoupons,
        (_: CheckoutState, { giftCertificates }: CheckoutSelectorDependencies) => giftCertificates.getGiftCertificates,
        (data, getBillingAddress, getCart, getCustomer, getConsignments, getCoupons, getGiftCertificates) => () => {
            const billingAddress = getBillingAddress();
            const cart = getCart();
            const customer = getCustomer();
            const consignments = getConsignments() || [];
            const coupons = getCoupons() || [];
            const giftCertificates = getGiftCertificates() || [];

            if (!data || !cart || !customer) {
                return;
            }

            return {
                ...data,
                billingAddress,
                cart,
                customer,
                consignments,
                coupons,
                giftCertificates,
            };
        }
    );

    const getCheckoutOrThrow = createSelector(
        getCheckout,
        getCheckout => () => {
            return guard(getCheckout(), () => new MissingDataError(MissingDataErrorType.MissingCheckout));
        }
    );

    const getOutstandingBalance = createSelector(
        getCheckout,
        getCheckout => (useStoreCredit?: boolean) => {
            const checkout = getCheckout();

            if (!checkout) {
                return;
            }

            const grandTotal = checkout.grandTotal || 0;
            const storeCredit = checkout.customer.storeCredit || 0;

            return useStoreCredit ? Math.max(grandTotal - storeCredit, 0) : checkout.outstandingBalance;
        }
    );

    const getLoadError = createSelector(
        (state: CheckoutState) => state.errors.loadError,
        error => () => error
    );

    const getUpdateError = createSelector(
        (state: CheckoutState) => state.errors.updateError,
        error => () => error
    );

    const isExecutingSpamCheck = createSelector(
        (state: CheckoutState) => state.statuses.isExecutingSpamCheck,
        isExecutingSpamCheck => () => isExecutingSpamCheck === true
    );

    const isLoading = createSelector(
        (state: CheckoutState) => state.statuses.isLoading,
        isLoading => () => isLoading === true
    );

    const isUpdating = createSelector(
        (state: CheckoutState) => state.statuses.isUpdating,
        isUpdating => () => isUpdating === true
    );

    return memoizeOne((
        state: CheckoutState = DEFAULT_STATE,
        billingAddress: BillingAddressSelector,
        cart: CartSelector,
        consignments: ConsignmentSelector,
        coupons: CouponSelector,
        customer: CustomerSelector,
        giftCertificates: GiftCertificateSelector
    ): CheckoutSelector => {
        return {
            getCheckout: getCheckout(state, {
                billingAddress,
                cart,
                consignments,
                coupons,
                customer,
                giftCertificates,
            }),
            getCheckoutOrThrow: getCheckoutOrThrow(state, {
                billingAddress,
                cart,
                consignments,
                coupons,
                customer,
                giftCertificates,
            }),
            getOutstandingBalance: getOutstandingBalance(state, {
                billingAddress,
                cart,
                consignments,
                coupons,
                customer,
                giftCertificates,
            }),
            getLoadError: getLoadError(state),
            getUpdateError: getUpdateError(state),
            isExecutingSpamCheck: isExecutingSpamCheck(state),
            isLoading: isLoading(state),
            isUpdating: isUpdating(state),
        };
    });
}
