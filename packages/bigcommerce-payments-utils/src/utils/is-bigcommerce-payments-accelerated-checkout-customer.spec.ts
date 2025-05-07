import isBigCommercePaymentsAcceleratedCheckoutCustomer from './is-bigcommerce-payments-accelerated-checkout-customer';

describe('isBigCommercePaymentsAcceleratedCheckoutCustomer', () => {
    it('returns true if payment provider customer is BigCommercePayments related', () => {
        const paymentProviderCustomer = {
            authenticationState: 'success',
            addresses: [],
            instruments: [],
        };

        expect(isBigCommercePaymentsAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(
            true,
        );
    });

    it('returns false if payment provider customer is not BigCommercePayments related', () => {
        const paymentProviderCustomer = {
            stripeLinkAuthenticationState: true,
        };

        expect(isBigCommercePaymentsAcceleratedCheckoutCustomer(paymentProviderCustomer)).toBe(
            false,
        );
    });
});
