import GooglePayWorldpayInitializer from './googlepay-worldpay-access-initializer';
import {
    getCheckoutMock,
    getGooglePayWorldpayAccessPaymentDataMock,
    getGooglePayWorldpayAccessPaymentDataRequest,
    getGooglePayWorldpayAccessPaymentMethodMock,
    getGooglePayWorldpayAccessTokenizedPayload,
} from './googlepay.mock';

describe('GooglePayWorldpayInitializer', () => {
    let googlePayInitializer: GooglePayWorldpayInitializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayWorldpayInitializer();
    });

    it('creates an instance of GooglePayWorldpayInitializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayWorldpayInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for Worldpay', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getGooglePayWorldpayAccessPaymentMethodMock(),
                false,
            );

            expect(initialize).toEqual(getGooglePayWorldpayAccessPaymentDataRequest());
        });

        it('initializes the google pay configuration for worldpayaccess with Buy Now Flow', async () => {
            const paymentDataRequest = {
                ...getGooglePayWorldpayAccessPaymentDataRequest(),
                transactionInfo: {
                    ...getGooglePayWorldpayAccessPaymentDataRequest().transactionInfo,
                    currencyCode: '',
                    totalPrice: '',
                },
            };

            await googlePayInitializer
                .initialize(undefined, getGooglePayWorldpayAccessPaymentMethodMock(), false)
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
                getGooglePayWorldpayAccessPaymentDataMock(),
            );

            expect(tokenizePayload).toEqual(getGooglePayWorldpayAccessTokenizedPayload());
        });
    });
});
