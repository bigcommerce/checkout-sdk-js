const PAYPAL_FASTLANE_SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'zh'];
const PAYPAL_FASTLANE_DEFAULT_LOCALE = 'en_us';

/**
 * Transforms store language to PayPal Fastlane locale format.
 * Fastlane supports only US locales: 'en_us', 'es_us', 'fr_us', 'zh_us'.
 * Falls back to 'en_us' if the language is not supported.
 * Examples: 'fr' -> 'fr_us', 'es-MX' -> 'es_us', 'de' -> 'en_us'
 */
export default function getPayPalFastlaneLocale(storeLanguage: string | undefined): string {
    const language = storeLanguage?.split(/[-_]/)[0].toLowerCase();

    return language && PAYPAL_FASTLANE_SUPPORTED_LANGUAGES.includes(language)
        ? `${language}_us`
        : PAYPAL_FASTLANE_DEFAULT_LOCALE;
}
