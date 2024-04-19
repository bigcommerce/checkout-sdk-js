import GooglePayCybersourceV2Initializer from './googlepay-cybersourcev2-initializer';
import {
    getCheckoutMock,
    getCybersourceV2PaymentDataMock,
    getCybersourceV2PaymentDataRequest,
    getCybersourceV2PaymentMethodMock,
    getCybersourceV2TokenizedPayload,
} from './googlepay.mock';

describe('GooglePayCybersourceV2Initializer', () => {
    let googlePayInitializer: GooglePayCybersourceV2Initializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayCybersourceV2Initializer();
    });

    it('creates an instance of GooglePayCybersourceV2Initializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayCybersourceV2Initializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for Cybersourcev2', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getCybersourceV2PaymentMethodMock(),
                false,
            );

            expect(initialize).toEqual(getCybersourceV2PaymentDataRequest());
        });

        it('initializes the google pay configuration for cybersourcev2 with Buy Now Flow', async () => {
            const paymentDataRequest = {
                ...getCybersourceV2PaymentDataRequest(),
                transactionInfo: {
                    ...getCybersourceV2PaymentDataRequest().transactionInfo,
                    currencyCode: '',
                    totalPrice: '',
                },
            };

            await googlePayInitializer
                .initialize(undefined, getCybersourceV2PaymentMethodMock(), false)
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
                getCybersourceV2PaymentDataMock(),
            );

            expect(tokenizePayload).toEqual(getCybersourceV2TokenizedPayload());
        });
    });
});
