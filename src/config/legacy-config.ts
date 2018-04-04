import { FormFields, PasswordRequirements } from './config';

export default interface LegacyConfig {
    bigpayBaseUrl: string;
    cartLink: string;
    checkoutLink: string;
    cdnPath: string;
    checkout: LegacyCheckout;
    clientSidePaymentProviders: string[];
    currency: LegacyCurrency;
    shopperCurrency: LegacyShopperCurrency;
    storeConfig: LegacyStoreConfig;
    defaultNewsletterSignup: boolean;
    imageDirectory: string;
    isAngularDebuggingEnabled: boolean;
    passwordRequirements: PasswordRequirements;
    orderConfirmationLink: string;
    orderEmail: string;
    shopPath: string;
    showNewsletterSignup: boolean;
    storeCountry: string;
    storeHash: string;
    storeId: string;
    storeName: string;
    storePhoneNumber: string;
    storeLanguage: string;
}

export interface LegacyStoreConfig {
    formFields: FormFields;
}

export interface LegacyShopperCurrency {
    code: string;
    symbol_location: string;
    symbol: string;
    decimal_places: string;
    decimal_separator: string;
    thousands_separator: string;
    exchange_rate: string;
}

export interface LegacyCurrency {
    code: string;
    decimal_places: string;
    decimal_separator: string;
    symbol_location: string;
    symbol: string;
    thousands_separator: string;
}

export interface LegacyCheckout {
    enableOrderComments: number;
    enableTermsAndConditions: number;
    guestCheckoutEnabled: number;
    isCardVaultingEnabled: boolean;
    isPaymentRequestEnabled: boolean;
    isPaymentRequestCanMakePaymentEnabled: boolean;
    orderTermsAndConditions: string;
    orderTermsAndConditionsLink: string;
    orderTermsAndConditionsType: string;
    shippingQuoteFailedMessage: string;
    realtimeShippingProviders: string[];
    remoteCheckoutProviders: string[];
}
