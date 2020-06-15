import GooglePayAuthorizeNetInitializer from './googlepay-authorizenet-initializer';
import { getAuthorizeNetPaymentDataMock,  getAuthorizeNetPaymentDataRequest,  getAuthorizeNetPaymentMethodMock, getAuthorizeNetTokenizedPayload, getCheckoutMock } from './googlepay.mock';

describe('GooglePayAuthorizeNetInitializer', () => {
    let googlePayInitializer: GooglePayAuthorizeNetInitializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayAuthorizeNetInitializer();
    });

    it('creates an instance of GooglePayAuthorizeNetInitializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayAuthorizeNetInitializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for authorize.net', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getAuthorizeNetPaymentMethodMock(),
                false
            );

            expect(initialize).toEqual(getAuthorizeNetPaymentDataRequest());
        });
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(googlePayInitializer.teardown()).resolves.toBeUndefined();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(getAuthorizeNetPaymentDataMock());

            expect(tokenizePayload).toEqual(getAuthorizeNetTokenizedPayload());
        });
    });
});
