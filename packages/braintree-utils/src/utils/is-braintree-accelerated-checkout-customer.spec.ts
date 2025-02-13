import isBraintreeAcceleratedCheckoutCustomer from './is-braintree-accelerated-checkout-customer';

describe('isBraintreeAcceleratedCheckoutCustomer', () => {
    it('returns true if payment provider customer is Braintree related', () => {
        const paymentProviderCustomer = {
            authenticationState: 'success',
            addresses: [],
            instruments: [],
        };

        expect(isBraintreeAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(true);
    });

    it('returns false if payment provider customer is not Braintree related', () => {
        const paymentProviderCustomer = {
            stripeLinkAuthenticationState: true,
        };

        expect(isBraintreeAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(false);
    });

    it('returns false if customer is not provided', () => {
        expect(isBraintreeAcceleratedCheckoutCustomer(undefined)).toBe(false);
    });
});
