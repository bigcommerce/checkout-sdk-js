import { getPaymentMethod } from '../payment/payment-methods.mock';

import CheckoutSelector from './checkout-selector';
import { getCheckout, getCheckoutState, getCheckoutWithPayments } from './checkouts.mock';

describe('CheckoutSelector', () => {
    it('returns checkout', () => {
        const selector = new CheckoutSelector(getCheckoutState());

        expect(selector.getCheckout()).toEqual(getCheckout());
    });

    it('returns load error', () => {
        const loadError = new Error();
        const selector = new CheckoutSelector({
            ...getCheckoutState(),
            errors: { loadError },
        });

        expect(selector.getLoadError()).toEqual(loadError);
    });

    it('returns loading status', () => {
        const selector = new CheckoutSelector({
            ...getCheckoutState(),
            statuses: { isLoading: true },
        });

        expect(selector.isLoading()).toEqual(true);
    });

    it('returns payment method used for checkout', () => {
        const selector = new CheckoutSelector({ ...getCheckoutState(), data: getCheckoutWithPayments() });

        expect(selector.getHostedPayment().providerId).toEqual(getPaymentMethod().id);
    });
});
