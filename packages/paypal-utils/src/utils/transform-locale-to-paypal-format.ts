import { PAYPAL_SDK_SUPPORTED_LOCALES } from '../paypal-commerce-constants';

/**
 * Transforms store language to PayPal SDK locale format.
 * PayPal SDK expects locale in format 'en_US' (underscore separator).
 * Returns undefined if the locale is not supported by PayPal SDK.
 * Examples: 'fr-CA' -> 'fr_CA', 'fr' -> 'fr_FR'
 */
export default function transformLocaleToPayPalFormat(
    storeLanguage: string | undefined,
): string | undefined {
    if (!storeLanguage) {
        return undefined;
    }

    let locale: string;

    if (storeLanguage.includes('-')) {
        const [language, region] = storeLanguage.split('-');

        locale = `${language}_${region.toUpperCase()}`;
    } else {
        locale = `${storeLanguage}_${storeLanguage.toUpperCase()}`;
    }

    return PAYPAL_SDK_SUPPORTED_LOCALES.includes(locale) ? locale : undefined;
}
