import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getBraintreePaypalSdkLocale from './get-braintree-paypal-sdk-locale';

describe('getBraintreePaypalSdkLocale', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    const mockStoreLanguage = (storeLanguage: string) =>
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            storeProfile: { ...getConfig().storeConfig.storeProfile, storeLanguage },
        });

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue(undefined);
    });

    it('transforms store language to PayPal SDK locale', () => {
        mockStoreLanguage('de');

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBe('de_DE');
    });

    it('keeps region of store language', () => {
        mockStoreLanguage('fr-CA');

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBe('fr_CA');
    });

    it('returns undefined if store language is not supported', () => {
        mockStoreLanguage('xx');

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBeUndefined();
    });

    it('returns undefined if store config is not available', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue(
            undefined,
        );

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBeUndefined();
    });

    it('prefers shopper locale over store language', () => {
        mockStoreLanguage('en_US');
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('de');

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBe('de_DE');
    });

    it('supports locales with underscore separator', () => {
        mockStoreLanguage('en_US');

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBe('en_US');
    });

    it('falls back to store language if shopper locale is not supported', () => {
        mockStoreLanguage('fr');
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('xx');

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBe('fr_FR');
    });

    it.each([
        ['en', 'en_US'],
        ['ja', 'ja_JP'],
        ['zh', 'zh_CN'],
        ['sv', 'sv_SE'],
    ])('maps language-only shopper locale %s to %s', (locale, expected) => {
        mockStoreLanguage('de');
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue(locale);

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBe(expected);
    });

    it('does not use default region for unsupported locale with region', () => {
        mockStoreLanguage('de');
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('en-XX');

        expect(getBraintreePaypalSdkLocale(paymentIntegrationService.getState())).toBe('de_DE');
    });
});
