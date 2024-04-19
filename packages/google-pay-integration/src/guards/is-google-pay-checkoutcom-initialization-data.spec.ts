import getGooglePayBaseInitializationData from '../mocks/google-pay-base-initialization-data.mock';

import assertIsGooglePayCheckoutComInitializationData from './is-google-pay-checkoutcom-initialization-data';

describe('assertIsGooglePayCheckoutComInitializationData', () => {
    it('should be Checkout Com initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            checkoutcomkey: '1234567',
        };

        expect(() => assertIsGooglePayCheckoutComInitializationData(data)).not.toThrow();
    });

    it('should NOT be Checkout Com initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            paymentGatewayId: '1234567',
        };

        expect(() => assertIsGooglePayCheckoutComInitializationData(data)).toThrow();
    });
});
