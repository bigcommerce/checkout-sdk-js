import GooglePayAuthorizeNetInitializer from './googlepay-authorizenet-initializer';
import { getCheckoutMock, getGooglePaymentDataMockForAuthNet, getGooglePayAuthorizeNetPaymentDataRequestMock, getGooglePayTokenizePayloadAuthNet, getPaymentMethodMockForAuthNet } from './googlepay.mock';

describe('GooglePayAuthorizeNetInitializer', () => {
    let googlePayAuthorizeNetInitializer: GooglePayAuthorizeNetInitializer;

    beforeEach(() => {
        googlePayAuthorizeNetInitializer = new GooglePayAuthorizeNetInitializer();
    });

    it('creates an instance of GooglePayAuthorizeNetInitializer', () => {
        expect(googlePayAuthorizeNetInitializer).toBeInstanceOf(GooglePayAuthorizeNetInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for authorize.net', async () => {
            const initialize = await googlePayAuthorizeNetInitializer.initialize(
                getCheckoutMock(),
                getPaymentMethodMockForAuthNet(),
                false
            );

            expect(initialize).toEqual(getGooglePayAuthorizeNetPaymentDataRequestMock());
        });
    });

    describe('#teardown', () => {
        it('teardowns the initializer', () => expect(googlePayAuthorizeNetInitializer.teardown()).resolves.toBeUndefined());
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', () => {
            const tokenizePayload = googlePayAuthorizeNetInitializer.parseResponse(getGooglePaymentDataMockForAuthNet());

            expect(tokenizePayload).toEqual(getGooglePayTokenizePayloadAuthNet());
        });
    });
});
