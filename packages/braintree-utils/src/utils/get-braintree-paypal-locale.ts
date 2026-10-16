import { PaymentIntegrationSelectors } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { PAYPAL_SDK_SUPPORTED_LOCALES } from '@bigcommerce/checkout-sdk/paypal-utils';

/**
 * Default regions for languages where the region code differs from the language code
 * (e.g. 'ja' -> 'ja_JP', not 'ja_JA')
 */
const PAYPAL_DEFAULT_LANGUAGE_REGIONS: Record<string, string> = {
    ar: 'EG',
    cs: 'CZ',
    da: 'DK',
    el: 'GR',
    en: 'US',
    et: 'EE',
    he: 'IL',
    ja: 'JP',
    ko: 'KR',
    ms: 'MY',
    si: 'LK',
    sl: 'SI',
    sq: 'AL',
    sv: 'SE',
    tl: 'PH',
    vi: 'VN',
    zh: 'CN',
};

/**
 * Transforms locale to PayPal format supported by Braintree PayPal
 * Examples: 'ja' -> 'ja_JP', 'fr-CA' -> 'fr_CA', 'en_GB' -> 'en_GB', 'de-XX' -> 'de_DE'
 */
export function transformToBraintreePaypalLocale(locale?: string): string | undefined {
    if (!locale) {
        return undefined;
    }

    const [language, region] = locale.trim().split(/[-_]/);
    const languageCode = language.toLowerCase();
    const defaultRegion =
        PAYPAL_DEFAULT_LANGUAGE_REGIONS[languageCode] || languageCode.toUpperCase();

    const candidates = [
        ...(region ? [`${languageCode}_${region.toUpperCase()}`] : []),
        `${languageCode}_${defaultRegion}`,
    ];

    return candidates.find((candidate) => PAYPAL_SDK_SUPPORTED_LOCALES.includes(candidate));
}

/**
 * Returns shopper locale (or store language as a fallback) in PayPal format
 */
export default function getBraintreePaypalLocale(
    state: PaymentIntegrationSelectors,
): string | undefined {
    return (
        transformToBraintreePaypalLocale(state.getLocale()) ||
        transformToBraintreePaypalLocale(state.getStoreConfig()?.storeProfile.storeLanguage)
    );
}
