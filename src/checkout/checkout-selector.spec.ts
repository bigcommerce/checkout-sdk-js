import { merge } from 'lodash';

import { createCheckoutSelectorFactory, CheckoutSelectorFactory } from './checkout-selector';
import CheckoutStoreState from './checkout-store-state';
import { getCheckout, getCheckoutState, getCheckoutStoreState } from './checkouts.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import InternalCheckoutSelectors from './internal-checkout-selectors';

describe('CheckoutSelector', () => {
    let createCheckoutSelector: CheckoutSelectorFactory;
    let selectors: InternalCheckoutSelectors;
    let state: CheckoutStoreState;

    beforeEach(() => {
        createCheckoutSelector = createCheckoutSelectorFactory();
        state = getCheckoutStoreState();
        selectors = createInternalCheckoutSelectors(state);
    });

    it('returns checkout', () => {
        const selector = createCheckoutSelector(state.checkout, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

        expect(selector.getCheckout()).toEqual({
            ...getCheckout(),
            cart: selectors.cart.getCart(),
            consignments: selectors.consignments.getConsignments(),
            coupons: selectors.coupons.getCoupons(),
            giftCertificates: selectors.giftCertificates.getGiftCertificates(),
        });
    });

    it('returns load error', () => {
        const loadError = new Error();
        const selector = createCheckoutSelector({
            ...getCheckoutState(),
            errors: { loadError },
        }, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

        expect(selector.getLoadError()).toEqual(loadError);
    });

    it('returns loading status', () => {
        const selector = createCheckoutSelector({
            ...getCheckoutState(),
            statuses: { isLoading: true },
        }, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

        expect(selector.isLoading()).toEqual(true);
    });

    it('returns update error', () => {
        const updateError = new Error();
        const selector = createCheckoutSelector({
            ...getCheckoutState(),
            errors: { updateError },
        }, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

        expect(selector.getUpdateError()).toEqual(updateError);
    });

    it('returns updating status', () => {
        const selector = createCheckoutSelector({
            ...getCheckoutState(),
            statuses: { isUpdating: true },
        }, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

        expect(selector.isUpdating()).toEqual(true);
    });

    it('returns grand total with store credit if flag is passed', () => {
        state = merge(getCheckoutStoreState(), {
            customer: { data: { storeCredit: 50 } },
        });
        selectors = createInternalCheckoutSelectors(state);

        const selector = createCheckoutSelector(
            state.checkout,
            selectors.billingAddress,
            selectors.cart,
            selectors.consignments,
            selectors.coupons,
            selectors.customer,
            selectors.giftCertificates
        );

        expect(selector.getGrandTotal(true))
            .toEqual(140);

        expect(selector.getGrandTotal())
            .toEqual(190);
    });
});
