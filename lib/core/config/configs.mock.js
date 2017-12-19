"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getAppConfig() {
    return {
        bigpayBaseUrl: 'https://bigpay.integration.zone',
        cartLink: 'https://store-k1drp8k8.bcapp.dev/cart.php',
        checkoutLink: '/checkout',
        cdnPath: 'https://cdn.bcapp.dev/rHEAD',
        checkout: {
            enableOrderComments: 1,
            enableTermsAndConditions: 0,
            guestCheckoutEnabled: 1,
            isPaymentRequestEnabled: false,
            isPaymentRequestCanMakePaymentEnabled: false,
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
            'cybersource',
            'sagepay',
            'squarev2',
            'afterpay',
            'vantiv',
        ],
        currency: {
            code: 'USD',
            decimal_places: '2',
            decimal_separator: '.',
            symbol_location: 'left',
            symbol: '$',
            thousands_separator: ',',
        },
        shopperCurrency: {
            code: 'USD',
            symbol_location: 'left',
            symbol: '$',
            decimal_places: '2',
            decimal_separator: '.',
            thousands_separator: ',',
            exchange_rate: '1.0000000000',
        },
        defaultNewsletterSignup: false,
        passwordRequirements: {
            alpha: '/[A-Za-z]/',
            numeric: '/[0-9]/',
            minlength: 7,
            error: 'Passwords must be at least 7 characters and contain both alphabetic and numeric characters.',
        },
        orderConfirmationLink: '/checkout/order-confirmation',
        orderEmail: 's1504098821@example.com',
        shopPath: 'https://store-k1drp8k8.bcapp.dev',
        showNewsletterSignup: true,
        storeCountry: 'United States',
        storeHash: 'k1drp8k8',
        storeId: '1504098821',
        storeName: 's1504098821',
        storePhoneNumber: '987654321',
        storeLanguage: 'en_US',
    };
}
exports.getAppConfig = getAppConfig;
function getSeedData() {
    return {
        'form-fields': {
            shippingAddressFields: [],
            billingAddressFormFields: [],
        },
        'payment': {
            token: null,
        },
    };
}
exports.getSeedData = getSeedData;
function getConfigState() {
    return {
        data: getAppConfig(),
    };
}
exports.getConfigState = getConfigState;
//# sourceMappingURL=configs.mock.js.map