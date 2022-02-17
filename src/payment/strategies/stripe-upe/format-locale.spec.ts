import formatLocale from './format-locale';

describe('formatLocale', () => {
    it('fixes the format of locales with a dash', () => {
        expect(formatLocale('en_GB'))
        .toBe('en-GB');
    });

    it('fixes the format of locales with lower case country code', () => {
        expect(formatLocale('fr-ca'))
        .toBe('fr-CA');
    });

    it('uses a default locale with unsupported languages', () => {
        expect(formatLocale('sa'))
        .toBe('auto');
    });

    it('uses a default locale with invalid input', () => {
        expect(formatLocale('esp_mex'))
        .toBe('auto');
    });

    it('only uses the valid part of a string', () => {
        expect(formatLocale('pt_br_invalid_data'))
        .toBe('pt-BR');
    });

    it('uses the latin America spanish number if provided', () => {
        expect(formatLocale('es-419'))
        .toBe('es-419');
    });

    it('maintains the value of valid locale', () => {
        expect(formatLocale('zh-HK'))
        .toBe('zh-HK');
    });

    it('maintains the value of valid language only code', () => {
        expect(formatLocale('fil'))
        .toBe('fil');
    });
});
