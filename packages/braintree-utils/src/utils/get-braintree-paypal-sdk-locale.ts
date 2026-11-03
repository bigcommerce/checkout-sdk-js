import { PaymentIntegrationSelectors } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { transformLocaleToPayPalFormat } from '@bigcommerce/checkout-sdk/paypal-utils';

/**
 * Default PayPal SDK locales for language-only codes whose language and region differ
 * (transformLocaleToPayPalFormat would turn 'en' into the unsupported 'en_EN')
 */
const DEFAULT_PAYPAL_SDK_LOCALES: Record<string, string> = {
    ar: 'ar_EG',
    cs: 'cs_CZ',
    da: 'da_DK',
    el: 'el_GR',
    en: 'en_US',
    et: 'et_EE',
    he: 'he_IL',
    ja: 'ja_JP',
    ko: 'ko_KR',
    ms: 'ms_MY',
    si: 'si_LK',
    sl: 'sl_SI',
    sq: 'sq_AL',
    sv: 'sv_SE',
    tl: 'tl_PH',
    vi: 'vi_VN',
    zh: 'zh_CN',
};

const toPayPalSdkLocale = (locale?: string): string | undefined => {
    const normalizedLocale = locale?.trim().replace('_', '-');

    if (!normalizedLocale) {
        return undefined;
    }

    return (
        transformLocaleToPayPalFormat(normalizedLocale) ||
        (normalizedLocale.includes('-')
            ? undefined
            : DEFAULT_PAYPAL_SDK_LOCALES[normalizedLocale.toLowerCase()])
    );
};

/**
 * Returns shopper locale (or store language as a fallback) in the format supported by PayPal SDK
 * (e.g. 'de' -> 'de_DE', 'en' -> 'en_US'), or undefined if neither is supported
 */
export default function getBraintreePaypalSdkLocale(
    state: PaymentIntegrationSelectors,
): string | undefined {
    return (
        toPayPalSdkLocale(state.getLocale()) ||
        toPayPalSdkLocale(state.getStoreConfig()?.storeProfile.storeLanguage)
    );
}
