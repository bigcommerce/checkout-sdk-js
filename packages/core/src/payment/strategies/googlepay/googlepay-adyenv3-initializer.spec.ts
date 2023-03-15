import GooglePayAdyenV3Initializer from './googlepay-adyenv3-initializer';
import {
    getAdyenV2PaymentDataMock,
    getAdyenV2PaymentDataRequest,
    getAdyenV2PaymentMethodMock,
    getAdyenV2TokenizedPayload,
    getCheckoutMock,
    getPaymentMethodMock,
} from './googlepay.mock';

describe('GooglePayAdyenV3Initializer', () => {
    let googlePayInitializer: GooglePayAdyenV3Initializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayAdyenV3Initializer();
    });

    it('creates an instance of GooglePayAdyenV3Initializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayAdyenV3Initializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for adyenv3', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getAdyenV2PaymentMethodMock(),
                false,
            );

            expect(initialize).toEqual(getAdyenV2PaymentDataRequest());
        });

        it('initializes the google pay configuration for adyenv3 with Buy Now Flow', async () => {
            const paymentData = await googlePayInitializer.initialize(
                undefined,
                getPaymentMethodMock(),
                false,
            );

            expect(paymentData).toEqual(
                expect.objectContaining({
                    transactionInfo: {
                        currencyCode: '',
                        totalPriceStatus: 'FINAL',
                        totalPrice: '',
                    },
                }),
            );
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
                getAdyenV2PaymentDataMock(),
            );

            expect(tokenizePayload).toEqual(getAdyenV2TokenizedPayload());
        });
    });
});
