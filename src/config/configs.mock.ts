import { getFormFields } from '../form/form.mocks';

import Config from './config';
import ConfigState from './config-state';

export function getConfig(): Config {
    return {
        context: {
            checkoutId: '6a6071cc-82ba-45aa-adb0-ebec42d6ff6f',
            flashMessages: [],
            geoCountryCode: 'AU',
            payment: {},
        },
        customization: {
            languageData: [],
        },
        storeConfig: {
            cdnPath: 'https://cdn.bcapp.dev/rHEAD',
            checkoutSettings: {
                enableOrderComments: true,
                enableTermsAndConditions: false,
                guestCheckoutEnabled: true,
                isCardVaultingEnabled: true,
                isPaymentRequestEnabled: false,
                isPaymentRequestCanMakePaymentEnabled: false,
                isCouponCodeCollapsed: true,
                orderTermsAndConditions: '',
                orderTermsAndConditionsLink: '',
                orderTermsAndConditionsType: '',
                shippingQuoteFailedMessage: 'Unfortunately one or more items in your cart can\'t be shipped to your location. Please choose a different delivery address.',
                realtimeShippingProviders: [
                    'Fedex',
                    'UPS',
                    'USPS',
                ],
                remoteCheckoutProviders: [],
            },
            currency: {
                code: 'USD',
                decimalPlaces: '2',
                decimalSeparator: '.',
                symbolLocation: 'left',
                symbol: '$',
                thousandsSeparator: ',',
            },
            formFields: {
                shippingAddressFields: getFormFields(),
                billingAddressFields: getFormFields(),
            },
            links: {
                cartLink: 'https://store-k1drp8k8.bcapp.dev/cart.php',
                checkoutLink: '/checkout',
                orderConfirmationLink: '/checkout/order-confirmation',
            },
            paymentSettings: {
                bigpayBaseUrl: 'https://bigpay.integration.zone',
                clientSidePaymentProviders: [
                    'migs',
                    'eway',
                    'securenet',
                    'usaepay',
                    'elavon',
                    'hps',
                    'quickbooks',
                    'orbital',
                    'stripe',
                    'authorizenet',
                    'firstdatae4v14',
                    'nmi',
                    'braintree',
                    'braintreepaypal',
                    'paypal',
                    'sagepay',
                    'squarev2',
                    'afterpay',
                    'vantiv',
                ],
            },
            shopperConfig: {
                defaultNewsletterSignup: false,
                passwordRequirements: {
                    alpha: '/[A-Za-z]/',
                    numeric: '/[0-9]/',
                    minlength: 7,
                    error: 'Passwords must be at least 7 characters and contain both alphabetic and numeric characters.',
                },
                showNewsletterSignup: true,
            },
            storeProfile: {
                orderEmail: 's1504098821@example.com',
                shopPath: 'https://store-k1drp8k8.bcapp.dev',
                storeCountry: 'United States',
                storeHash: 'k1drp8k8',
                storeId: '1504098821',
                storeName: 's1504098821',
                storePhoneNumber: '987654321',
                storeLanguage: 'en_US',
            },
            imageDirectory: 'product_images',
            isAngularDebuggingEnabled: false,
            shopperCurrency: {
                code: 'USD',
                symbolLocation: 'left',
                symbol: '$',
                decimalPlaces: '2',
                decimalSeparator: '.',
                thousandsSeparator: ',',
                exchangeRate: '1.0000000000',
            },
        },
    };
}

export function getConfigState(): ConfigState {
    return {
        data: getConfig(),
        meta: {
            externalSource: 'Partner',
        },
        errors: {},
        statuses: {},
    };
}
