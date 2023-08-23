import getGooglePayBaseInitializationData from '../mocks/google-pay-base-initialization-data.mock';

import assertsIsGooglePayAuthorizeNetInitializationData from './is-google-pay-authorizenet-initialization-data';

describe('assertsIsGooglePayAuthorizeNetInitializationData', () => {
    it('should be Authorize Net initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            paymentGatewayId: '1234567',
        };

        expect(() => assertsIsGooglePayAuthorizeNetInitializationData(data)).not.toThrow();
    });

    it('should NOT be Authorize Net initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            checkoutcomkey: '1234567',
        };

        expect(() => assertsIsGooglePayAuthorizeNetInitializationData(data)).toThrow();
    });
});
