import getGooglePayBaseInitializationData from '../mocks/google-pay-base-initialization-data.mock';

import {
    assertsIsGooglePayAdyenV2InitializationData,
    assertsIsGooglePayAdyenV3InitializationData,
} from './is-google-pay-adyen-initialization-data';

describe('assertsIsGooglePayAdyenV2InitializationData', () => {
    it('should be AdyenV2 initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            originKey: '1244352',
            clientKey: '1244352',
            paymentMethodsResponse: {},
        };

        expect(() => assertsIsGooglePayAdyenV2InitializationData(data)).not.toThrow();
    });

    it('should NOT be AdyenV2 initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            clientKey: '1234567',
        };

        expect(() => assertsIsGooglePayAdyenV2InitializationData(data)).toThrow();
    });

    it('should NOT be AdyenV3 initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            originKey: '1244352',
            clientKey: '1244352',
            paymentMethodsResponse: {},
        };

        expect(() => assertsIsGooglePayAdyenV3InitializationData(data)).not.toThrow();
    });

    it('should be AdyenV3 initialization data', () => {
        const data = {
            ...getGooglePayBaseInitializationData(),
            clientKey: '1234567',
        };

        expect(() => assertsIsGooglePayAdyenV3InitializationData(data)).toThrow();
    });
});
