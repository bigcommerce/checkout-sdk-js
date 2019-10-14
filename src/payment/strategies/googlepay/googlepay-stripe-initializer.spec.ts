import { InvalidArgumentError } from '../../../common/error/errors';

import GooglePayStripeInitializer from './googlepay-stripe-initializer';
import { getCheckoutMock, getGooglePaymentDataMock, getGooglePaymentStripeDataMock, getGooglePayStripePaymentDataRequestMock, getGooglePayTokenizePayloadStripe, getPaymentMethodMock } from './googlepay.mock';

describe('GooglePayStripeInitializer', () => {
    it('creates an instance of GooglePayStripeInitializer', () => {
        const googlePayStripeInitializer = new GooglePayStripeInitializer();

        expect(googlePayStripeInitializer).toBeInstanceOf(GooglePayStripeInitializer);
    });

    describe('#initialize', () => {
        let googlePayStripeInitializer: GooglePayStripeInitializer;

        beforeEach(() => {
            googlePayStripeInitializer = new GooglePayStripeInitializer();
        });

        it('initializes the google pay configuration for stripe', async () => {
            const googlePayPaymentDataRequestV2 = await googlePayStripeInitializer.initialize(
                getCheckoutMock(),
                getPaymentMethodMock(),
                false
            );

            expect(googlePayPaymentDataRequestV2).toEqual(getGooglePayStripePaymentDataRequestMock());
        });
    });

    describe('#teardown', () => {
        let googlePayStripeInitializer: GooglePayStripeInitializer;

        beforeEach(() => {
            googlePayStripeInitializer = new GooglePayStripeInitializer();
        });

        it('teardowns the initializer', async () => {
            await googlePayStripeInitializer.teardown().then(() => {
                expect(googlePayStripeInitializer.teardown).toBeDefined();
            });
        });
    });

    describe('#parseResponse', () => {
        let googlePayStripeInitializer: GooglePayStripeInitializer;

        beforeEach(() => {
            googlePayStripeInitializer = new GooglePayStripeInitializer();
        });

        it('parses a response from google pay payload received', () => {
            const tokenizePayload = googlePayStripeInitializer.parseResponse(getGooglePaymentStripeDataMock());

            expect(tokenizePayload).toBeTruthy();
            expect(tokenizePayload).toEqual(getGooglePayTokenizePayloadStripe());
        });

        it('throws when try to parse a response from google pay payload received', () => {
            try {
                googlePayStripeInitializer.parseResponse(getGooglePaymentDataMock());
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidArgumentError);
                expect(error).toEqual(new InvalidArgumentError('Unable to parse response from Google Pay.'));
            }
        });
    });
});
