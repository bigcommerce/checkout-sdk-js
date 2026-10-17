import { PaymentIntegrationSelectors } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * Locales supported by Braintree Fastlane
 * Fastlane is available for US buyers only, so every locale has US region
 */
const BRAINTREE_FASTLANE_DEFAULT_LOCALE = 'en_us';

const BRAINTREE_FASTLANE_SUPPORTED_LOCALES: Record<string, string> = {
    en: 'en_us',
    es: 'es_us',
    fr: 'fr_us',
    zh: 'zh_us',
};

/**
 * Transforms locale to the format supported by Braintree Fastlane
 * Examples: 'es' -> 'es_us', 'fr-CA' -> 'fr_us', 'zh_CN' -> 'zh_us', 'ja' -> 'en_us'
 */
export function transformToBraintreeFastlaneLocale(locale?: string): string | undefined {
    if (!locale) {
        return undefined;
    }

    const [language] = locale.trim().split(/[-_]/);

    return BRAINTREE_FASTLANE_SUPPORTED_LOCALES[language.toLowerCase()];
}

/**
 * Returns shopper locale (or store language as a fallback) in Braintree Fastlane format
 */
export default function getBraintreeFastlaneLocale(state: PaymentIntegrationSelectors): string {
    return (
        transformToBraintreeFastlaneLocale(state.getLocale()) ||
        transformToBraintreeFastlaneLocale(state.getStoreConfig()?.storeProfile.storeLanguage) ||
        BRAINTREE_FASTLANE_DEFAULT_LOCALE
    );
}
