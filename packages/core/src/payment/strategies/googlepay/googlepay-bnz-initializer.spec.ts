import GooglePayBNZInitializer from './googlepay-bnz-initializer';
import {
    getBNZPaymentDataMock,
    getBNZPaymentDataRequest,
    getBNZPaymentMethodMock,
    getBNZTokenizedPayload,
    getBraintreePaymentDataPayload,
    getCheckoutMock,
    getPaymentMethodMock,
} from './googlepay.mock';

describe('GooglePayBNZInitializer', () => {
    let googlePayInitializer: GooglePayBNZInitializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayBNZInitializer();
    });

    it('creates an instance of GooglePayBNZ Initializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayBNZInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for BNZ', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getBNZPaymentMethodMock(),
                false,
            );

            expect(initialize).toEqual(getBNZPaymentDataRequest());
        });

        it('initializes the google pay configuration for BNZ with Buy Now Flow', async () => {
            const paymentDataRequest = getBraintreePaymentDataPayload();

            paymentDataRequest.transactionInfo.currencyCode = '';
            paymentDataRequest.transactionInfo.totalPrice = '';

            await googlePayInitializer
                .initialize(undefined, getPaymentMethodMock(), false)
                .then((paymentData) => {
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
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(googlePayInitializer.teardown()).resolves.toBeUndefined();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(
                getBNZPaymentDataMock(),
            );

            expect(tokenizePayload).toEqual(getBNZTokenizedPayload());
        });
    });
});
