import {
    resolveAffirmCountryCode,
    resolveAffirmLocale,
    toAlpha3CountryCode,
} from './affirm-market';

describe('affirm-market', () => {
    describe('resolveAffirmCountryCode()', () => {
        it('prefers the country code from the initialization data', () => {
            expect(resolveAffirmCountryCode({ countryCode: 'CAN' }, 'USD')).toBe('CAN');
        });

        it('falls back to the country of the currency', () => {
            expect(resolveAffirmCountryCode(undefined, 'CAD')).toBe('CAN');
            expect(resolveAffirmCountryCode({}, 'gbp')).toBe('GBR');
        });

        it('defaults to the US', () => {
            expect(resolveAffirmCountryCode(undefined, undefined)).toBe('USA');
            expect(resolveAffirmCountryCode(undefined, 'EUR')).toBe('USA');
        });
    });

    describe('resolveAffirmLocale()', () => {
        it('prefers the locale from the initialization data', () => {
            expect(resolveAffirmLocale({ locale: 'fr_CA' }, 'CAN', 'en-US')).toBe('fr_CA');
        });

        it('builds the locale from the store language and the market', () => {
            expect(resolveAffirmLocale(undefined, 'CAN', 'fr-CA')).toBe('fr_CA');
            expect(resolveAffirmLocale(undefined, 'CAN', 'en')).toBe('en_CA');
            expect(resolveAffirmLocale(undefined, 'GBR', 'en-GB')).toBe('en_GB');
            expect(resolveAffirmLocale(undefined, 'USA', 'en_US')).toBe('en_US');
        });

        it('falls back to English for a language the market does not support', () => {
            expect(resolveAffirmLocale(undefined, 'GBR', 'fr')).toBe('en_GB');
            expect(resolveAffirmLocale(undefined, 'USA', undefined)).toBe('en_US');
        });
    });

    describe('toAlpha3CountryCode()', () => {
        it('maps the Affirm markets to alpha-3 codes', () => {
            expect(toAlpha3CountryCode('US')).toBe('USA');
            expect(toAlpha3CountryCode('ca')).toBe('CAN');
            expect(toAlpha3CountryCode('GB')).toBe('GBR');
        });

        it('leaves other countries unchanged', () => {
            expect(toAlpha3CountryCode('FR')).toBe('FR');
        });
    });
});
