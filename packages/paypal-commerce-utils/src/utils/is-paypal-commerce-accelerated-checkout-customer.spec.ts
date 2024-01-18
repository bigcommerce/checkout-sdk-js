import isPayPalCommerceAcceleratedCheckoutCustomer from './is-paypal-commerce-accelerated-checkout-customer';

describe('isPayPalCommerceAcceleratedCheckoutCustomer', () => {
    it('returns true if payment provider customer is PayPalCommerce related', () => {
        const paymentProviderCustomer = {
            authenticationState: 'success',
            addresses: [],
            instruments: [],
        };

        expect(isPayPalCommerceAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(true);
    });

    it('returns false if payment provider customer is not PayPalCommerce related', () => {
        const paymentProviderCustomer = {
            stripeLinkAuthenticationState: true,
        };

        expect(isPayPalCommerceAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(false);
    });
});
