import PaymentMethod from './payment-method';
import PaymentMethodState from './payment-method-state';

export function getBraintree(): PaymentMethod {
    return {
        id: 'braintree',
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
            enablePaypal: true,
            merchantId: '',
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBraintreePaypal(): PaymentMethod {
    return {
        id: 'braintreepaypal',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}

export function getBraintreePaypalCredit(): PaymentMethod {
    return {
        id: 'braintreepaypalcredit',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}

export function getBraintreeVisaCheckout(): PaymentMethod {
    return {
        id: 'braintreevisacheckout',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            testMode: false,
            isVisaCheckoutEnabled: true,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getPaypalExpress(): PaymentMethod {
    return {
        id: 'paypalexpress',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            merchantId: 'h3hxn44tdd8wxkzd',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getAdyenAmex(): PaymentMethod {
    return {
        id: 'amex',
        gateway: 'adyen',
        logoUrl: '',
        method: 'multi-option',
        supportedCards: [],
        config: {
            displayName: 'AMEX',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_HOSTED',
    };
}

export function getAuthorizenet(): PaymentMethod {
    return {
        id: 'authorizenet',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Authorizenet',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getCybersource(): PaymentMethod {
    return {
        id: 'cybersource',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Cybersource',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getBankDeposit(): PaymentMethod {
    return {
        id: 'bankdeposit',
        logoUrl: '',
        method: 'offline',
        supportedCards: [],
        config: {
            displayName: 'Bank Deposit',
            helpText: 'Type any special instructions in here.',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_OFFLINE',
    };
}

export function getKlarna(): PaymentMethod {
    return {
        id: 'klarna',
        logoUrl: '',
        method: 'widget',
        supportedCards: [],
        config: {
            displayName: 'Pay Over Time',
            helpText: 'Type any special instructions in here.',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}

export function getAfterpay(): PaymentMethod {
    return {
        id: 'PAY_BY_INSTALLMENT',
        gateway: 'afterpay',
        logoUrl: '',
        method: 'multi-option',
        supportedCards: [],
        config: {
            displayName: 'Pay over time',
            merchantId: '33133',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}

export function getAmazonPay(): PaymentMethod {
    return {
        id: 'amazon',
        logoUrl: '',
        method: 'widget',
        supportedCards: [],
        config: {
            displayName: 'AmazonPay',
            merchantId: '0c173620-beb6-4421-99ef-03dc71a60685',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            clientId: '087eccf4-7f68-4384-b0a9-5f2fd6b0d344',
            region: 'US',
            redirectUrl: '/remote-checkout/amazon/redirect',
            tokenPrefix: 'ABCD|',
        },
    };
}

export function getSquare(): PaymentMethod {
    return {
        id: 'square',
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
            enablePaypal: true,
            merchantId: '',
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            applicationId: 'test',
            env: 'bar',
            locationId: 'foo',
        },
    };
}
export function getChasePay(): PaymentMethod {
    return {
        id: 'chasepay',
        logoUrl: '',
        method: 'chasepay',
        supportedCards: [],
        config: {
            displayName: 'Chase Pay',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            digitalSessionId: 'digitalSessionId',
        },
    };
}

export function getWepay(): PaymentMethod {
    return {
        id: 'wepay',
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
            enablePaypal: false,
            merchantId: '',
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getPaymentMethod(): PaymentMethod {
    return getAuthorizenet();
}

export function getPaymentMethods(): PaymentMethod[] {
    return [
        getBraintree(),
        getBraintreePaypal(),
        getBraintreePaypalCredit(),
        getBraintreeVisaCheckout(),
        getAdyenAmex(),
        getAuthorizenet(),
        getPaypalExpress(),
        getAfterpay(),
        getAmazonPay(),
        getKlarna(),
        getSquare(),
    ];
}

export function getPaymentMethodsMeta() {
    return {
        geoCountryCode: 'AU',
        deviceSessionId: 'a37230e9a8e4ea2d7765e2f3e19f7b1d',
        sessionHash: 'cfbbbac580a920b395571fe086db1e06',
    };
}

export function getPaymentMethodsState(): PaymentMethodState {
    return {
        data: getPaymentMethods(),
        meta: getPaymentMethodsMeta(),
        errors: {},
        statuses: {},
    };
}
