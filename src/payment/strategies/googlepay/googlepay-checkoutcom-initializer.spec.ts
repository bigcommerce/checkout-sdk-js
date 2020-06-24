import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { InvalidArgumentError } from '../../../common/error/errors';

import GooglePayCheckoutcomInitializer from './googlepay-checkoutcom-initializer';
import { getCheckoutMock, getGooglePaymentCheckoutcomDataMock, getGooglePaymentDataMock, getGooglePayCheckoutcomPaymentDataRequestMock, getGooglePayTokenizePayloadCheckoutcom, getPaymentMethodMock } from './googlepay.mock';

describe('GooglePayCheckoutcomInitializer', () => {
    const requestSender: RequestSender = createRequestSender();
    let googlePayCheckoutcomInitializer: GooglePayCheckoutcomInitializer;

    beforeAll(() => {
        jest.spyOn(requestSender, 'post').mockReturnValue(Promise.resolve({ body: { token: 'parsedToken' } }));
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
                false
            );

            expect(googlePayPaymentDataRequestV2).toEqual(getGooglePayCheckoutcomPaymentDataRequestMock());
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
        beforeEach(() => {
            jest.spyOn(RequestSender.prototype, 'post').mockReturnValue(Promise.resolve({ body: { token: 'parsedToken' } }));
        });

        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayCheckoutcomInitializer.parseResponse(getGooglePaymentCheckoutcomDataMock());

            expect(tokenizePayload).toBeTruthy();
            expect(tokenizePayload).toEqual(getGooglePayTokenizePayloadCheckoutcom());
        });

        it('throws when try to parse a response from google pay payload received', () => {
            const response = googlePayCheckoutcomInitializer.parseResponse(getGooglePaymentDataMock());
            expect(response).rejects.toThrow(new InvalidArgumentError('Unable to parse response from Google Pay.'));
        });

    });
});
