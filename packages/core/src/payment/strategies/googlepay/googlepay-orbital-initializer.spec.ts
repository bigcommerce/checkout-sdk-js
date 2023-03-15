import GooglePayOrbitalInitializer from './googlepay-orbital-initializer';
import {
    getCheckoutMock,
    getOrbitalPaymentDataMock,
    getOrbitalPaymentDataRequest,
    getOrbitalPaymentMethodMock,
    getOrbitalTokenizedPayload,
} from './googlepay.mock';

describe('GooglePayCybersourceV2Initializer', () => {
    let googlePayInitializer: GooglePayOrbitalInitializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayOrbitalInitializer();
    });

    it('creates an instance of GooglePayCybersourceV2Initializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayOrbitalInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for Cybersourcev2', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getOrbitalPaymentMethodMock(),
                false,
            );

            expect(initialize).toEqual(getOrbitalPaymentDataRequest());
        });

        it('initializes the google pay configuration for orbital with Buy Now Flow', async () => {
            const paymentDataRequest = {
                ...getOrbitalPaymentDataRequest(),
                transactionInfo: {
                    ...getOrbitalPaymentDataRequest().transactionInfo,
                    currencyCode: '',
                    totalPrice: '',
                },
            };

            await googlePayInitializer
                .initialize(undefined, getOrbitalPaymentMethodMock(), false)
                .then((response) => {
                    expect(response).toEqual(paymentDataRequest);
                });
        });
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(() => googlePayInitializer.teardown()).not.toThrow();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(
                getOrbitalPaymentDataMock(),
            );

            expect(tokenizePayload).toEqual(getOrbitalTokenizedPayload());
        });
    });
});
