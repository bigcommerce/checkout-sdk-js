import CheckoutSelector from './checkout-selector';
import CheckoutStoreState from './checkout-store-state';
import { getCheckout, getCheckoutState, getCheckoutStoreState } from './checkouts.mock';
import createInternalCheckoutSelectors from './create-internal-checkout-selectors';
import InternalCheckoutSelectors from './internal-checkout-selectors';

describe('CheckoutSelector', () => {
    let selectors: InternalCheckoutSelectors;
    let state: CheckoutStoreState;

    beforeEach(() => {
        state = getCheckoutStoreState();
        selectors = createInternalCheckoutSelectors(state);
    });

    it('returns checkout', () => {
        const selector = new CheckoutSelector(state.checkout, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

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
        const selector = new CheckoutSelector({
            ...getCheckoutState(),
            errors: { loadError },
        }, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

        expect(selector.getLoadError()).toEqual(loadError);
    });

    it('returns loading status', () => {
        const selector = new CheckoutSelector({
            ...getCheckoutState(),
            statuses: { isLoading: true },
        }, selectors.billingAddress, selectors.cart, selectors.consignments, selectors.coupons, selectors.customer, selectors.giftCertificates);

        expect(selector.isLoading()).toEqual(true);
    });
});
