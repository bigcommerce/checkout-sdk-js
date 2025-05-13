import isPayPalFastlaneCustomer from './is-paypal-fastlane-customer';

describe('isPayPalFastlaneCustomer', () => {
    it('returns true if payment provider customer is PayPal Fastlane related', () => {
        const paymentProviderCustomer = {
            authenticationState: 'success',
            addresses: [],
            instruments: [],
        };

        expect(isPayPalFastlaneCustomer(paymentProviderCustomer)).toBe(true);
    });

    it('returns false if payment provider customer is not PayPal Fastlane related', () => {
        const paymentProviderCustomer = {
            stripeLinkAuthenticationState: true,
        };

        expect(isPayPalFastlaneCustomer(paymentProviderCustomer)).toBe(false);
    });
});
