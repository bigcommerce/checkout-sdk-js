export function getBraintree() {
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

export function getBraintreePaypal() {
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

export function getPaypalExpress() {
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

export function getAdyenAmex() {
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

export function getAuthorizenet() {
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

export function getCybersource() {
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

export function getBankDeposit() {
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

export function getKlarna() {
    return {
        id: 'klarna',
        gateway: null,
        logoUrl: '',
        method: 'widget',
        supportedCards: [],
        config: {
            displayName: 'Pay Over Time',
            cardCode: null,
            helpText: 'Type any special instructions in here.',
            enablePaypal: null,
            merchantId: null,
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: null,
        clientToken: 'foo',
        returnUrl: null,
    };
}


export function getAfterpay() {
    return {
        id: 'PAY_BY_INSTALLMENT',
        gateway: 'afterpay',
        logoUrl: '',
        method: 'multi-option',
        supportedCards: [],
        config: {
            displayName: 'Pay over time',
            cardCode: null,
            helpText: null,
            enablePaypal: null,
            merchantId: '33133',
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: null,
        clientToken: 'foo',
        returnUrl: null,
    };
}

export function getAmazonPay() {
    return {
        id: 'amazon',
        gateway: null,
        logoUrl: '',
        method: 'widget',
        supportedCards: [],
        config: {
            displayName: 'AmazonPay',
            cardCode: null,
            helpText: null,
            enablePaypal: null,
            merchantId: '0c173620-beb6-4421-99ef-03dc71a60685',
            is3dsEnabled: null,
            testMode: false,
            isVisaCheckoutEnabled: null,
        },
        type: 'PAYMENT_TYPE_API',
        nonce: null,
        initializationData: {
            clientId: '087eccf4-7f68-4384-b0a9-5f2fd6b0d344',
            region: 'US',
            redirectUrl: '/remote-checkout/amazon/redirect',
            tokenPrefix: 'ABCD|',
        },
        clientToken: null,
        returnUrl: null,
    };
}

export function getSquare() {
    return {
        id: 'square',
        gateway: null,
        logoUrl: '',
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

export function getWepay() {
    return {
        id: 'wepay',
        gateway: null,
        logoUrl: '',
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
            cardCode: null,
            helpText: null,
            enablePaypal: false,
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

export function getPaymentMethod() {
    return getAuthorizenet();
}

export function getPaymentMethods() {
    return [
        getBraintree(),
        getBraintreePaypal(),
        getAdyenAmex(),
        getAuthorizenet(),
        getPaypalExpress(),
    ];
}

export function getPaymentMethodResponseBody() {
    return {
        data: {
            paymentMethod: getPaymentMethod(),
        },
        meta: {},
    };
}

export function getPaymentMethodsResponseBody() {
    return {
        data: {
            paymentMethods: getPaymentMethods(),
        },
        meta: {},
    };
}

export function getPaymentMethodsState() {
    return {
        data: getPaymentMethods(),
        meta: {},
    };
}
