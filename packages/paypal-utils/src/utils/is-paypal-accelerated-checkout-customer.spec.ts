import isPaypalAcceleratedCheckoutCustomer from './is-paypal-accelerated-checkout-customer';

describe('isPaypalAcceleratedCheckoutCustomer', () => {
    it('returns true if payment provider customer is PayPal related', () => {
        const paymentProviderCustomer = {
            authenticationState: 'success',
            addresses: [],
            instruments: [],
        };

        expect(isPaypalAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(true);
    });

    it('returns false if payment provider customer is not PayPal related', () => {
        const paymentProviderCustomer = {
            stripeLinkAuthenticationState: true,
        };

        expect(isPaypalAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(false);
    });
});
