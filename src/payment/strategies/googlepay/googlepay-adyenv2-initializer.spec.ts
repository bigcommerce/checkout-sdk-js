import GooglePayAdyenV2Initializer from './googlepay-adyenv2-initializer';
import { getAdyenV2PaymentDataMock, getAdyenV2PaymentDataRequest, getAdyenV2PaymentMethodMock, getAdyenV2TokenizedPayload, getCheckoutMock } from './googlepay.mock';

describe('GooglePayAdyenV2Initializer', () => {
    let googlePayInitializer: GooglePayAdyenV2Initializer;

    beforeEach(() => {
        googlePayInitializer = new GooglePayAdyenV2Initializer();
    });

    it('creates an instance of GooglePayAdyenV2Initializer', () => {
        expect(googlePayInitializer).toBeInstanceOf(GooglePayAdyenV2Initializer);
    });

    describe('#initialize', () => {
        it('initializes the google pay configuration for adyenv2', async () => {
            const initialize = await googlePayInitializer.initialize(
                getCheckoutMock(),
                getAdyenV2PaymentMethodMock(),
                false
            );

            expect(initialize).toEqual(getAdyenV2PaymentDataRequest());
        });
    });

    describe('#teardown', () => {
        it('teardown the initializer', () => {
            expect(googlePayInitializer.teardown()).resolves.toBeUndefined();
        });
    });

    describe('#parseResponse', () => {
        it('parses a response from google pay payload received', async () => {
            const tokenizePayload = await googlePayInitializer.parseResponse(getAdyenV2PaymentDataMock());

            expect(tokenizePayload).toEqual(getAdyenV2TokenizedPayload());
        });
    });
});
