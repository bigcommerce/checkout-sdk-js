import GooglePayStripeUPEInitializer from './googlepay-stripe-upe-initializer';
import {
    getCheckoutMock,
    getStripePaymentDataMock,
    getStripePaymentDataRequest,
    getStripePaymentMethodMock,
    getStripeTokenizedPayload,
} from './googlepay.mock';

describe('GooglePayStripeUPEInitializer', () => {
    let googlePayInitializer: GooglePayStripeUPEInitializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayStripeUPEInitializer();
    });

    it('creates an instance of GooglePayStripeUPEInitializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayStripeUPEInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for Stripe UPE', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getStripePaymentMethodMock(),
                false,
            );

            expect(initialize).toEqual(getStripePaymentDataRequest());
        });

        it('initializes the google pay configuration for stripe-upe with Buy Now Flow', async () => {
            const paymentDataRequest = {
                ...getStripePaymentDataRequest(),
                transactionInfo: {
                    ...getStripePaymentDataRequest().transactionInfo,
                    currencyCode: '',
                    totalPrice: '',
                },
            };

            await googlePayInitializer
                .initialize(undefined, getStripePaymentMethodMock(), false)
                .then((response) => {
                    expect(response).toEqual(paymentDataRequest);
                });
        });
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(googlePayInitializer.teardown()).resolves.toBeUndefined();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(
                getStripePaymentDataMock(),
            );

            expect(tokenizePayload).toEqual(getStripeTokenizedPayload());
        });
    });
});
