import { StoreConfig } from './config';
import LegacyConfig from './legacy-config';

export default function mapToLegacyConfig(storeConfig: StoreConfig): LegacyConfig {
    return {
        ...storeConfig.links,
        ...storeConfig.paymentSettings,
        ...storeConfig.shopperConfig,
        ...storeConfig.storeProfile,
        storeConfig: {
            formFields: storeConfig.formFields,
        },
        imageDirectory: storeConfig.imageDirectory,
        isAngularDebuggingEnabled: storeConfig.isAngularDebuggingEnabled,
        cdnPath: storeConfig.cdnPath,
        checkout: {
            ...storeConfig.checkoutSettings,
            enableOrderComments: storeConfig.checkoutSettings.enableOrderComments ? 1 : 0,
            enableTermsAndConditions: storeConfig.checkoutSettings.enableTermsAndConditions ? 1 : 0,
            guestCheckoutEnabled: storeConfig.checkoutSettings.guestCheckoutEnabled ? 1 : 0,
        },
        currency: {
            code: storeConfig.currency.code,
            symbol_location: storeConfig.currency.symbolLocation,
            symbol: storeConfig.currency.symbol,
            decimal_places: storeConfig.currency.decimalPlaces,
            decimal_separator: storeConfig.currency.decimalSeparator,
            thousands_separator: storeConfig.currency.thousandsSeparator,
        },
        shopperCurrency: {
            code: storeConfig.shopperCurrency.code,
            symbol_location: storeConfig.shopperCurrency.symbolLocation,
            symbol: storeConfig.shopperCurrency.symbol,
            decimal_places: storeConfig.shopperCurrency.decimalPlaces,
            decimal_separator: storeConfig.shopperCurrency.decimalSeparator,
            thousands_separator: storeConfig.shopperCurrency.thousandsSeparator,
            exchange_rate: storeConfig.shopperCurrency.exchangeRate,
        },
    };
}
