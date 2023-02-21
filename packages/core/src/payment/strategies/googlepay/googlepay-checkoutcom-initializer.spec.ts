import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';
import { merge } from 'lodash';

import { PaymentMethodFailedError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { InvalidArgumentError } from '../../../common/error/errors';

import GooglePayCheckoutcomInitializer from './googlepay-checkoutcom-initializer';
import {
    getBraintreePaymentDataPayload,
    getCheckoutMock,
    getGooglePayCheckoutcomPaymentDataRequestMock,
    getGooglePaymentCheckoutcomDataMock,
    getGooglePaymentDataMock,
    getGooglePayTokenizePayloadCheckoutcom,
    getPaymentMethodMock,
} from './googlepay.mock';

describe('GooglePayCheckoutcomInitializer', () => {
    const requestSender: RequestSender = createRequestSender();
    let googlePayCheckoutcomInitializer: GooglePayCheckoutcomInitializer;

    beforeAll(() => {
        jest.spyOn(requestSender, 'post').mockReturnValue(
            Promise.resolve({ body: { token: 'parsedToken' } }),
        );
    });

    beforeEach(() => {
        googlePayCheckoutcomInitializer = new GooglePayCheckoutcomInitializer(requestSender);
    });

    it('creates an instance of GooglePayCheckoutcomInitializer', () => {
        expect(googlePayCheckoutcomInitializer).toBeInstanceOf(GooglePayCheckoutcomInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for Checkoutcom', async () => {
            const googlePayPaymentDataRequestV2 = await googlePayCheckoutcomInitializer.initialize(
                getCheckoutMock(),
                getPaymentMethodMock(),
                false,
            );

            expect(googlePayPaymentDataRequestV2).toEqual(
                getGooglePayCheckoutcomPaymentDataRequestMock(),
            );
        });

        it('initializes the google pay configuration for checkoutcom with Buy Now Flow', async () => {
            const paymentDataRequest = getBraintreePaymentDataPayload();

            paymentDataRequest.transactionInfo.currencyCode = '';
            paymentDataRequest.transactionInfo.totalPrice = '';

            await googlePayCheckoutcomInitializer
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
        it('teardowns the initializer', () => {
            googlePayCheckoutcomInitializer.teardown().then(() => {
                expect(googlePayCheckoutcomInitializer.teardown).toBeDefined();
            });
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayCheckoutcomInitializer.parseResponse(
                getGooglePaymentCheckoutcomDataMock(),
            );

            expect(tokenizePayload).toBeTruthy();
            expect(tokenizePayload).toEqual(getGooglePayTokenizePayloadCheckoutcom());
        });

        it('parses a response from google pay payload received with token format', async () => {
            jest.spyOn(requestSender, 'post').mockReturnValue(
                Promise.resolve({ body: { token: 'parsedToken', token_format: 'pan_only' } }),
            );

            const tokenizePayload = await googlePayCheckoutcomInitializer.parseResponse(
                getGooglePaymentCheckoutcomDataMock(),
            );

            expect(tokenizePayload).toBeTruthy();
            expect(tokenizePayload).toEqual(
                merge({ tokenFormat: 'pan_only' }, getGooglePayTokenizePayloadCheckoutcom()),
            );
        });

        it('throws when try to parse a response from google pay payload received', () => {
            const response = googlePayCheckoutcomInitializer.parseResponse(
                getGooglePaymentDataMock(),
            );

            expect(response).rejects.toThrow(
                new InvalidArgumentError('Unable to parse response from Google Pay.'),
            );
        });

        it('throws when token from google response is not a json', () => {
            const withoutToken = getGooglePaymentDataMock();

            withoutToken.paymentMethodData.tokenizationData.token = 'invalidjson';

            const response = googlePayCheckoutcomInitializer.parseResponse(withoutToken);

            expect(response).rejects.toThrow(
                new InvalidArgumentError('Unable to parse response from Google Pay.'),
            );
        });

        it('throws error when checkoutcom token is not received', async () => {
            jest.spyOn(requestSender, 'post').mockReturnValueOnce(
                Promise.resolve({ body: { token: '' } }),
            );

            try {
                await googlePayCheckoutcomInitializer.initialize(
                    getCheckoutMock(),
                    getPaymentMethodMock(),
                    true,
                );
                await googlePayCheckoutcomInitializer.parseResponse(
                    getGooglePaymentCheckoutcomDataMock(),
                );
            } catch (error) {
                expect(error).toEqual(
                    new PaymentMethodFailedError('Unable to parse response from Checkout.com'),
                );
            }
        });
    });
});
