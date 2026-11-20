import { AffirmCountryCode, AffirmInitializationData } from './affirm';

const COUNTRY_BY_CURRENCY: Record<string, AffirmCountryCode> = {
    USD: 'USA',
    CAD: 'CAN',
    GBP: 'GBR',
};

const ALPHA3_BY_ALPHA2: Record<string, string> = {
    US: 'USA',
    CA: 'CAN',
    GB: 'GBR',
};

const LANGUAGES_BY_COUNTRY: Record<AffirmCountryCode, string[]> = {
    USA: ['en'],
    CAN: ['en', 'fr'],
    GBR: ['en'],
};

const REGION_BY_COUNTRY: Record<AffirmCountryCode, string> = {
    USA: 'US',
    CAN: 'CA',
    GBR: 'GB',
};

export function resolveAffirmCountryCode(
    initializationData: AffirmInitializationData | undefined,
    currencyCode?: string,
): AffirmCountryCode {
    if (initializationData?.countryCode) {
        return initializationData.countryCode;
    }

    return (currencyCode && COUNTRY_BY_CURRENCY[currencyCode.toUpperCase()]) || 'USA';
}

export function resolveAffirmLocale(
    initializationData: AffirmInitializationData | undefined,
    countryCode: AffirmCountryCode,
    storeLocale?: string,
): string {
    if (initializationData?.locale) {
        return initializationData.locale;
    }

    const [language = 'en'] = (storeLocale || 'en').replace(/_/g, '-').toLowerCase().split('-');
    const supportedLanguage = LANGUAGES_BY_COUNTRY[countryCode].includes(language)
        ? language
        : 'en';

    return `${supportedLanguage}_${REGION_BY_COUNTRY[countryCode]}`;
}

export function toAlpha3CountryCode(countryCode: string): string {
    return ALPHA3_BY_ALPHA2[countryCode.toUpperCase()] || countryCode;
}
