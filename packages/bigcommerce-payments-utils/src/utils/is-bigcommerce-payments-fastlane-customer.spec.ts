import isBigCommercePaymentsFastlaneCustomer from './is-bigcommerce-payments-fastlane-customer';

// TODO: rename this file to is-bigcommerce-payments-accelerated-checkout-customer and class to isBigCommercePaymentsAcceleratedCheckoutCustomer
describe('isBigCommercePaymentsFastlaneCustomer', () => {
    it('returns true if payment provider customer is BigCommercePayments related', () => {
        const paymentProviderCustomer = {
            authenticationState: 'success',
            addresses: [],
            instruments: [],
        };

        expect(isBigCommercePaymentsFastlaneCustomer(paymentProviderCustomer)).toBe(true);
    });

    it('returns false if payment provider customer is not BigCommercePayments related', () => {
        const paymentProviderCustomer = {
            stripeLinkAuthenticationState: true,
        };

        expect(isBigCommercePaymentsFastlaneCustomer(paymentProviderCustomer)).toBe(false);
    });
});
