import GooglePayStripeInitializer from './googlepay-stripe-initializer';
import { getCheckoutMock, getStripePaymentDataMock, getStripePaymentDataRequest, getStripePaymentMethodMock, getStripeTokenizedPayload } from './googlepay.mock';

describe('GooglePayStripeInitializer', () => {
    let googlePayInitializer: GooglePayStripeInitializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayStripeInitializer();
    });

    it('creates an instance of GooglePayStripeInitializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayStripeInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for Stripe', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getStripePaymentMethodMock(),
                false
            );

            expect(initialize).toEqual(getStripePaymentDataRequest());
        });
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(googlePayInitializer.teardown()).resolves.toBeUndefined();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(getStripePaymentDataMock());

            expect(tokenizePayload).toEqual(getStripeTokenizedPayload());
        });
    });
});
