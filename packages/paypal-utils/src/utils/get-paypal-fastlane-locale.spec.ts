import getPayPalFastlaneLocale from './get-paypal-fastlane-locale';

describe('getPayPalFastlaneLocale', () => {
    it('returns default locale if storeLanguage is undefined', () => {
        expect(getPayPalFastlaneLocale(undefined)).toBe('en_us');
    });

    it('returns default locale if storeLanguage is empty string', () => {
        expect(getPayPalFastlaneLocale('')).toBe('en_us');
    });

    it('transforms language-only locale to Fastlane format', () => {
        expect(getPayPalFastlaneLocale('en')).toBe('en_us');
        expect(getPayPalFastlaneLocale('es')).toBe('es_us');
        expect(getPayPalFastlaneLocale('fr')).toBe('fr_us');
        expect(getPayPalFastlaneLocale('zh')).toBe('zh_us');
    });

    it('transforms locale with region to Fastlane format', () => {
        expect(getPayPalFastlaneLocale('en-us')).toBe('en_us');
        expect(getPayPalFastlaneLocale('es-MX')).toBe('es_us');
        expect(getPayPalFastlaneLocale('fr-CA')).toBe('fr_us');
        expect(getPayPalFastlaneLocale('zh_TW')).toBe('zh_us');
    });

    it('is case insensitive', () => {
        expect(getPayPalFastlaneLocale('FR-ca')).toBe('fr_us');
    });

    it('returns default locale for unsupported languages', () => {
        expect(getPayPalFastlaneLocale('de')).toBe('en_us');
        expect(getPayPalFastlaneLocale('it-IT')).toBe('en_us');
    });
});
