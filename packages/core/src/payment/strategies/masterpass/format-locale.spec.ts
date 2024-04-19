import formatLocale from './format-locale';

describe('formatLocale', () => {
    it('fixes the format of locales with a dash', () => {
        expect(formatLocale('en-us')).toBe('en_us');
    });

    it('fills language string with default country code', () => {
        expect(formatLocale('FR')).toBe('fr_fr');
    });

    it('corrects locale with unsupported country for a given language', () => {
        expect(formatLocale('zh_mx')).toBe('zh_sg');
    });

    it('uses a default locale with unsupported languages', () => {
        expect(formatLocale('tr')).toBe('en_us');
    });

    it('uses a default locale with invalid input', () => {
        expect(formatLocale('esp_mex')).toBe('en_us');
    });

    it('only uses the valid part of a string', () => {
        expect(formatLocale('es_mx_invalid_data')).toBe('es_mx');
    });

    it('uses the default country with invalid countries', () => {
        expect(formatLocale('es_mex')).toBe('es_es');
    });

    it('maintains the value of valid locale', () => {
        expect(formatLocale('uk_ua')).toBe('uk_ua');
    });
});
