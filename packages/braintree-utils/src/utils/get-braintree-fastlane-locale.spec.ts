import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getBraintreeFastlaneLocale, {
    transformToBraintreeFastlaneLocale,
} from './get-braintree-fastlane-locale';

describe('transformToBraintreeFastlaneLocale', () => {
    it('returns undefined if locale is not provided', () => {
        expect(transformToBraintreeFastlaneLocale(undefined)).toBeUndefined();
        expect(transformToBraintreeFastlaneLocale('')).toBeUndefined();
    });

    it('transforms language-only locale', () => {
        expect(transformToBraintreeFastlaneLocale('en')).toBe('en_us');
        expect(transformToBraintreeFastlaneLocale('es')).toBe('es_us');
        expect(transformToBraintreeFastlaneLocale('fr')).toBe('fr_us');
        expect(transformToBraintreeFastlaneLocale('zh')).toBe('zh_us');
    });

    it('transforms locale with region to US region', () => {
        expect(transformToBraintreeFastlaneLocale('fr-CA')).toBe('fr_us');
        expect(transformToBraintreeFastlaneLocale('es_ES')).toBe('es_us');
        expect(transformToBraintreeFastlaneLocale('ZH-cn')).toBe('zh_us');
    });

    it('returns undefined for unsupported language', () => {
        expect(transformToBraintreeFastlaneLocale('ja')).toBeUndefined();
        expect(transformToBraintreeFastlaneLocale('de-DE')).toBeUndefined();
    });
});

describe('getBraintreeFastlaneLocale', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            storeProfile: { ...getConfig().storeConfig.storeProfile, storeLanguage: 'fr' },
        });
    });

    it('returns shopper locale in Fastlane format', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('es');

        expect(getBraintreeFastlaneLocale(paymentIntegrationService.getState())).toBe('es_us');
    });

    it('falls back to store language if shopper locale is not available', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue(undefined);

        expect(getBraintreeFastlaneLocale(paymentIntegrationService.getState())).toBe('fr_us');
    });

    it('falls back to store language if shopper locale is not supported', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('ja');

        expect(getBraintreeFastlaneLocale(paymentIntegrationService.getState())).toBe('fr_us');
    });

    it('returns default locale if neither shopper locale nor store language is supported', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('ja');
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            storeProfile: { ...getConfig().storeConfig.storeProfile, storeLanguage: 'de' },
        });

        expect(getBraintreeFastlaneLocale(paymentIntegrationService.getState())).toBe('en_us');
    });
});
