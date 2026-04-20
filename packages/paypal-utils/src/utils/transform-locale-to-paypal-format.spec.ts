import transformLocaleToPayPalFormat from './transform-locale-to-paypal-format';

describe('transformLocaleToPayPalFormat', () => {
    it('returns undefined if storeLanguage is undefined', () => {
        expect(transformLocaleToPayPalFormat(undefined)).toBeUndefined();
    });

    it('returns undefined if storeLanguage is empty string', () => {
        expect(transformLocaleToPayPalFormat('')).toBeUndefined();
    });

    it('transforms locale with hyphen separator to PayPal format', () => {
        expect(transformLocaleToPayPalFormat('fr-CA')).toBe('fr_CA');
        expect(transformLocaleToPayPalFormat('en-US')).toBe('en_US');
        expect(transformLocaleToPayPalFormat('zh-TW')).toBe('zh_TW');
    });

    it('transforms locale with lowercase region to uppercase', () => {
        expect(transformLocaleToPayPalFormat('en-us')).toBe('en_US');
        expect(transformLocaleToPayPalFormat('fr-ca')).toBe('fr_CA');
    });

    it('transforms language-only locale to language_LANGUAGE format if supported', () => {
        expect(transformLocaleToPayPalFormat('fr')).toBe('fr_FR');
        expect(transformLocaleToPayPalFormat('it')).toBe('it_IT');
    });

    it('returns undefined for language-only locale if not supported', () => {
        expect(transformLocaleToPayPalFormat('en')).toBeUndefined();
        expect(transformLocaleToPayPalFormat('xx')).toBeUndefined();
    });

    it('returns locale for supported PayPal locales', () => {
        expect(transformLocaleToPayPalFormat('en-GB')).toBe('en_GB');
        expect(transformLocaleToPayPalFormat('de-DE')).toBe('de_DE');
        expect(transformLocaleToPayPalFormat('ja-JP')).toBe('ja_JP');
        expect(transformLocaleToPayPalFormat('pt-BR')).toBe('pt_BR');
    });
});
