import { PaymentIntegrationService } from '@bigcommerce/checkout-sdk/payment-integration-api';
import {
    getConfig,
    PaymentIntegrationServiceMock,
} from '@bigcommerce/checkout-sdk/payment-integrations-test-utils';

import getBraintreePaypalLocale, {
    transformToBraintreePaypalLocale,
} from './get-braintree-paypal-locale';

describe('transformToBraintreePaypalLocale', () => {
    it('returns undefined if locale is not provided', () => {
        expect(transformToBraintreePaypalLocale(undefined)).toBeUndefined();
        expect(transformToBraintreePaypalLocale('')).toBeUndefined();
    });

    it('transforms locale with hyphen separator', () => {
        expect(transformToBraintreePaypalLocale('fr-CA')).toBe('fr_CA');
        expect(transformToBraintreePaypalLocale('en-gb')).toBe('en_GB');
    });

    it('keeps locale with underscore separator', () => {
        expect(transformToBraintreePaypalLocale('en_US')).toBe('en_US');
        expect(transformToBraintreePaypalLocale('ja_JP')).toBe('ja_JP');
    });

    it('transforms language-only locale with matching region', () => {
        expect(transformToBraintreePaypalLocale('fr')).toBe('fr_FR');
        expect(transformToBraintreePaypalLocale('de')).toBe('de_DE');
    });

    it('transforms language-only locale using default region', () => {
        expect(transformToBraintreePaypalLocale('en')).toBe('en_US');
        expect(transformToBraintreePaypalLocale('ja')).toBe('ja_JP');
        expect(transformToBraintreePaypalLocale('sv')).toBe('sv_SE');
        expect(transformToBraintreePaypalLocale('zh')).toBe('zh_CN');
    });

    it('falls back to default region if provided region is not supported', () => {
        expect(transformToBraintreePaypalLocale('de-XX')).toBe('de_DE');
        expect(transformToBraintreePaypalLocale('ja-US')).toBe('ja_JP');
    });

    it('returns undefined for unsupported language', () => {
        expect(transformToBraintreePaypalLocale('xx')).toBeUndefined();
        expect(transformToBraintreePaypalLocale('no-NO')).toBeUndefined();
    });
});

describe('getBraintreePaypalLocale', () => {
    let paymentIntegrationService: PaymentIntegrationService;

    beforeEach(() => {
        paymentIntegrationService = new PaymentIntegrationServiceMock();

        jest.spyOn(paymentIntegrationService.getState(), 'getStoreConfig').mockReturnValue({
            ...getConfig().storeConfig,
            storeProfile: { ...getConfig().storeConfig.storeProfile, storeLanguage: 'fr' },
        });
    });

    it('returns shopper locale in PayPal format', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('ja');

        expect(getBraintreePaypalLocale(paymentIntegrationService.getState())).toBe('ja_JP');
    });

    it('falls back to store language if shopper locale is not available', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue(undefined);

        expect(getBraintreePaypalLocale(paymentIntegrationService.getState())).toBe('fr_FR');
    });

    it('falls back to store language if shopper locale is not supported', () => {
        jest.spyOn(paymentIntegrationService.getState(), 'getLocale').mockReturnValue('xx');

        expect(getBraintreePaypalLocale(paymentIntegrationService.getState())).toBe('fr_FR');
    });
});
