import getGooglePayBaseInitializationData from '../mocks/google-pay-base-initialization-data.mock';

import assertsIsGooglePayStripeInitializationData from './is-google-pay-stripe-initialization-data';

describe('assertsIsGooglePayStripeInitializationData', () => {
    it('should be Stripe initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            stripeConnectedAccount: 'foo',
            stripePublishableKey: 'bar',
            stripeVersion: 'baz',
        };

        expect(() => assertsIsGooglePayStripeInitializationData(data)).not.toThrow();
    });

    it('should NOT be Stripe initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            checkoutcomkey: '1234567',
        };

        expect(() => assertsIsGooglePayStripeInitializationData(data)).toThrow();
    });
});
