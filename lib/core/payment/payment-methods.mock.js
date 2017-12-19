"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBraintree() {
    return {
        id: 'braintree',
        gateway: null,
        logoUrl: 'https://cdn.bcapp.dev/rHEAD/modules/checkout/braintree/images/paypal_powered_braintree_horizontal.png',
        method: 'credit-card',
        supportedCards: [
            'VISA',
            'MC',
            'AMEX',
            'DISCOVER',
            'JCB',
            'DINERS',
        ],
        config: {
            displayName: 'Credit Card',
            cardCode: true,
            helpText: null,
            enablePaypal: true,
            merchantId: '',
            is3dsEnabled: null,
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    };
}
exports.getBraintree = getBraintree;
function getBraintreePaypal() {
    return {
        id: 'braintreepaypal',
        gateway: null,
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            displayName: null,
            cardCode: null,
            helpText: null,
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    };
}
exports.getBraintreePaypal = getBraintreePaypal;
function getPaypalExpress() {
    return {
        id: 'paypalexpress',
        gateway: null,
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            displayName: null,
            cardCode: null,
            helpText: null,
            enablePaypal: null,
            merchantId: 'h3hxn44tdd8wxkzd',
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    };
}
exports.getPaypalExpress = getPaypalExpress;
function getAdyenAmex() {
    return {
        id: 'amex',
        gateway: 'adyen',
        logoUrl: '',
        method: 'multi-option',
        supportedCards: [],
        config: {
            displayName: 'AMEX',
            cardCode: null,
            helpText: null,
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_HOSTED',
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    };
}
exports.getAdyenAmex = getAdyenAmex;
function getAuthorizenet() {
    return {
        id: 'authorizenet',
        gateway: null,
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Authorizenet',
            cardCode: null,
            helpText: null,
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    };
}
exports.getAuthorizenet = getAuthorizenet;
function getCybersource() {
    return {
        id: 'cybersource',
        gateway: null,
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Cybersource',
            cardCode: null,
            helpText: null,
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    };
}
exports.getCybersource = getCybersource;
function getBankDeposit() {
    return {
        id: 'bankdeposit',
        gateway: null,
        logoUrl: '',
        method: null,
        supportedCards: [],
        config: {
            displayName: 'Bank Deposit',
            cardCode: null,
            helpText: 'Type any special instructions in here.',
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_OFFLINE',
        nonce: null,
        initializationData: null,
        clientToken: null,
        returnUrl: null,
    };
}
exports.getBankDeposit = getBankDeposit;
function getPaymentMethod() {
    return getAuthorizenet();
}
exports.getPaymentMethod = getPaymentMethod;
function getPaymentMethods() {
    return [
        getBraintree(),
        getBraintreePaypal(),
        getAdyenAmex(),
        getAuthorizenet(),
        getPaypalExpress(),
    ];
}
exports.getPaymentMethods = getPaymentMethods;
function getPaymentMethodResponseBody() {
    return {
        data: {
            paymentMethod: getPaymentMethod(),
        },
        meta: {},
    };
}
exports.getPaymentMethodResponseBody = getPaymentMethodResponseBody;
function getPaymentMethodsResponseBody() {
    return {
        data: {
            paymentMethods: getPaymentMethods(),
        },
        meta: {},
    };
}
exports.getPaymentMethodsResponseBody = getPaymentMethodsResponseBody;
function getPaymentMethodsState() {
    return {
        data: getPaymentMethods(),
        meta: {},
    };
}
exports.getPaymentMethodsState = getPaymentMethodsState;
//# sourceMappingURL=payment-methods.mock.js.map