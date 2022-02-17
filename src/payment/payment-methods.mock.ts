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
        initializationData: {
            isBrainteeVenmoEnabled: false,
        },
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
        initializationData: {
            isBraintreeVenmoEnabled: false,
        },
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

export function getPaypalCommerce(): PaymentMethod {
    return {
        id: 'paypalcommerce',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            testMode: true,
            merchantId: 'JTS4DY7XFSQZE',
        },
        initializationData: {
            buttonStyle: {
                height: 55,
                color: 'black',
                label: 'pay',
            },
            clientId: 'abc',
            orderId: '3U4171152W1482642',
            intent: 'capture',
            isPayPalCreditAvailable: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getPaypal(): PaymentMethod {
    return {
        id: 'paypal',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            testMode: false,
            is3dsEnabled: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}

export function getPPSDK(): PaymentMethod {
    return {
        id: 'cabbagepay',
        method: 'credit-card',
        supportedCards: [],
        config: {},
        type: 'PAYMENT_TYPE_SDK',
        initializationStrategy: {
            type: 'none',
        },
    };
}

export function getUnsupportedPPSDK(): PaymentMethod {
    return {
        id: 'unsupported-cabbagepay',
        method: 'credit-card',
        supportedCards: [],
        config: {},
        type: 'PAYMENT_TYPE_SDK',
        initializationStrategy: {
            type: 'SOMETHING_UNSUPPORTED',
        },
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

export function getBlueSnapV2(): PaymentMethod {
    return {
        id: 'cc',
        gateway: 'bluesnapv2',
        logoUrl: '',
        method: 'multi-option',
        supportedCards: [],
        config: {
            displayName: 'Credit Card',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_HOSTED',
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
            is3dsEnabled: true,
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'cyberToken',
    };
}

export function getBarclays(): PaymentMethod {
    return {
        id: 'barclays',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        config: {
            displayName: 'Barclaycard Smartpay',
            is3dsEnabled: true,
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'barclaysToken',
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

export function getAffirm(): PaymentMethod {
    return {
        id: 'affirm',
        logoUrl: '',
        method: 'affirm',
        supportedCards: [],
        config: {
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'foo',
    };
}

export function getAmazonPayV2(region = 'us'): PaymentMethod {
    return {
        config: {
            displayName: 'AMAZON PAY',
            helpText: '',
            isVaultingEnabled: false,
            merchantId: 'checkout_amazonpay',
            requireCustomerCode: false,
            testMode: true,
        },
        id: 'amazonpay',
        initializationData: {
            buttonColor: 'Gold',
            checkoutLanguage: 'en_US',
            checkoutSessionMethod: 'GET',
            extractAmazonCheckoutSessionId: 'token',
            ledgerCurrency: 'USD',
            region,
        },
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [
            'VISA' ,
            'AMEX',
            'MC',
        ],
        type: 'PAYMENT_TYPE_API',
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
            is3dsEnabled: false,
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

export function getClearpay(): PaymentMethod {
    return {
        id: 'PAY_BY_INSTALLMENT',
        gateway: 'clearpay',
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

export function getHumm(): PaymentMethod {
    return {
        id: 'humm',
        logoUrl: '',
        method: 'humm',
        supportedCards: [],
        config: {
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
    };
}

export function getStripe(): PaymentMethod {
    return {
        id: 'stripe',
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
            paymentData: {
                nonce: undefined,
            },
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

export function getMasterpass(): PaymentMethod {
    return {
        id: 'masterpass',
        logoUrl: '',
        method: 'masterpass',
        supportedCards: [
            'VISA',
            'MC',
            'AMEX',
        ],
        config: {
            displayName: 'Masterpass',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
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

export function getGooglePay(): PaymentMethod {
    return {
        id: 'googlepay',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: [
            'VISA',
            'MC',
            'AMEX',
        ],
        config: {
            displayName: 'Google Pay',
            merchantId: '',
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        initializationData: {
            nonce: 'nonce',
            card_information: {
                type: 'MasterCard',
                number: '4111',
            },
        },
    };
}

export function getGooglePayAdyenV2(): PaymentMethod {
    return {
        id: 'googlepayadyenv2',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: [
            'VISA',
            'MC',
            'AMEX',
        ],
        config: {
            displayName: 'Google Pay',
            merchantId: '',
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        initializationData: {
            originKey: 'YOUR_ORIGIN_KEY',
            clientKey: 'YOUR_CLIENT_KEY',
            nonce: 'nonce',
            card_information: {
                type: 'MasterCard',
                number: '4111',
            },
        },
    };
}

export function getGooglePayCybersourceV2(): PaymentMethod {
    return {
        id: 'googlepaycybersourcev2',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: [
            'VISA',
            'MC',
            'AMEX',
        ],
        config: {
            displayName: 'Google Pay',
            merchantId: '',
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        initializationData: {
            originKey: 'YOUR_ORIGIN_KEY',
            clientKey: 'YOUR_CLIENT_KEY',
            nonce: 'nonce',
            card_information: {
                type: 'MasterCard',
                number: '4111',
            },
        },
    };
}

export function getGooglePayOrbital(): PaymentMethod {
    return {
        id: 'googlepayorbital',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: [
            'VISA',
            'MC',
            'AMEX',
        ],
        config: {
            displayName: 'Google Pay',
            merchantId: '',
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        initializationData: {
            originKey: 'YOUR_ORIGIN_KEY',
            clientKey: 'YOUR_CLIENT_KEY',
            nonce: 'nonce',
            card_information: {
                type: 'MasterCard',
                number: '4111',
            },
        },
    };
}

export function getZip(): PaymentMethod {
    return {
        id: 'zip',
        logoUrl: '',
        method: 'zip',
        supportedCards: [],
        config: {
            displayName: 'Zip',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: '{"id":"checkout_id"}',
        initializationData: {
            redirectUrl: 'http://some-url',
        },
    };
}

export function getQuadpay(): PaymentMethod {
    return {
        id: 'quadpay',
        logoUrl: '',
        method: 'quadpay',
        supportedCards: [],
        config: {
            displayName: 'Quadpay',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: '{"id":"checkout_id"}',
        initializationData: {
            redirectUrl: 'http://some-url',
        },
    };
}

export function getStripeV3(method: string = 'card', shouldUseIndividualCardFields: boolean = false, isHostedFormEnabled: boolean = false): PaymentMethod {
    return {
        id: method,
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Stripe',
            merchantId: '',
            testMode: true,
            isHostedFormEnabled,
        },
        initializationData: {
            stripePublishableKey: 'key',
            useIndividualCardFields: shouldUseIndividualCardFields,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        returnUrl: 'http://www.example.com',
    };
}

export function getStripeUPE(method: string = 'card'): PaymentMethod {
    return {
        id: method,
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Stripe',
            merchantId: '',
            testMode: true,
        },
        initializationData: {
            stripePublishableKey: 'key',
            stripeConnectedAccount: 'key',
            browserLanguageEnabled: false,
            shopperLanguage: 'en',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        returnUrl: 'http://www.example.com',
    };
}

export function getAdyenV2(method: string = 'scheme'): PaymentMethod {
    return {
        id: 'adyenv2',
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Adyen',
            merchantId: 'YOUR_MERCHANT_ID',
            testMode: true,
        },
        initializationData: {
            originKey: 'YOUR_ORIGIN_KEY',
            clientKey: 'YOUR_CLIENT_KEY',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
    };
}

export function getBolt(): PaymentMethod {
    return {
        id: 'bolt',
        logoUrl: '',
        method: 'bolt',
        supportedCards: [],
        config: {
            displayName: 'Bolt',
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            publishableKey: 'publishableKey',
            embeddedOneClickEnabled: false,
        },
        clientToken: 'clientToken',
    };
}

export function getPaymentMethod(): PaymentMethod {
    return getAuthorizenet();
}

export function getCheckoutcom(): PaymentMethod {
    return {
        id: 'checkoutcom',
        logoUrl: '',
        method: 'checkoutcom',
        supportedCards: [],
        config: {
            displayName: 'Checkout.com',
            merchantId: '',
            testMode: true,
        },
        initializationData: {
            checkoutcomkey: 'key',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
    };
}

export function getMollie(): PaymentMethod {
    return {
        id: 'mollie',
        gateway: '',
        logoUrl: 'https://charlsieremade-cloud-dev-vm.store.bcdev/rHEAD/modules/checkout/mollie/images/mollie.png',
        method: 'multi-options',
        supportedCards: [
            'VISA',
            'AMEX',
            'MC',
            'MAESTRO',
        ],
        config: {
            displayName: 'Mollie',
            hasDefaultStoredInstrument: false,
            helpText: '',
            is3dsEnabled: false,
            isHostedFormEnabled: true,
            isVaultingCvvEnabled: false,
            isVaultingEnabled: false,
            isVisaCheckoutEnabled: false,
            merchantId: 'test_T0k3n',
            requireCustomerCode: false,
            testMode: true,
        },
        initializationData: null,
        type: 'PAYMENT_TYPE_API',
    };
}

export function getMoneris(): PaymentMethod {
    return {
        id: 'moneris',
        gateway: '',
        logoUrl: '',
        method: 'moneris',
        supportedCards: [],
        config: {
            isHostedFormEnabled: false,
            displayName: 'Moneris',
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            profileId: 'ABC123',
            creditCardLabel: 'Credit Card',
            expiryDateLabel: 'Expiration Date',
            cvdLabel: 'CVV',
        },
    };
}

export function getOpy(): PaymentMethod {
    return {
        clientToken: '3000000091451',
        config: {
            displayName: 'Openpay',
            testMode: false,
        },
        id: 'opy',
        initializationData: {
            nextAction: {
                formPost: {
                    formFields: [
                        {
                            fieldName: 'TransactionToken',
                            fieldValue: 'Al5dE65...%3D',
                        },
                        {
                            fieldName: 'JamPlanID',
                            fieldValue: '3000000091451',
                        },
                    ],
                    formPostUrl: 'https://retailer.myopenpay.com.au/websalestraining/',
                },
                type: 'FormPost',
            },
            widgetConfig: {
                region: 'US',
                currency: '$',
                planTiers: [2, 4, 6],
                minEligibleAmount: 1,
                maxEligibleAmount: 10000,
                type: 'Online',
            },
        },
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC'],
        type: 'PAYMENT_TYPE_API',
    };
}

export function getPaymentMethods(): PaymentMethod[] {
    return [
        getAdyenAmex(),
        getAdyenV2(),
        getAffirm(),
        getAfterpay(),
        getAmazonPay(),
        getAmazonPayV2(),
        getAuthorizenet(),
        getBlueSnapV2(),
        getBraintree(),
        getBraintreePaypal(),
        getBraintreePaypalCredit(),
        getBraintreeVisaCheckout(),
        getCheckoutcom(),
        getClearpay(),
        getGooglePay(),
        getGooglePayAdyenV2(),
        getGooglePayCybersourceV2(),
        getGooglePayOrbital(),
        getHumm(),
        getKlarna(),
        getMollie(),
        getMoneris(),
        getOpy(),
        getPaypalCommerce(),
        getPaypalExpress(),
        getPPSDK(),
        getQuadpay(),
        getSquare(),
        getStripeV3(),
        getStripeUPE(),
        getUnsupportedPPSDK(),
        getApplePay(),
        getZip(),
    ];
}

export function getApplePay() {
    return {
        id: 'applepay',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        providesShippingAddress: false,
        config: {
            displayName: '',
            helpText: '',
            testMode: false,
            requireCustomerCode: false,
            isVaultingEnabled: false,
            hasDefaultStoredInstrument: false,
            isHostedFormEnabled: false,
        },
        type: 'PAYMENT_TYPE_WALLET',
        initializationStrategy: {
            type: 'not_applicable',
        },
        nonce: undefined,
        initializationData: {
            storeName: 'test store',
            countryCode: 'US',
            currencyCode: 'USD',
            supportedNetworks: [
                'visa',
                'masterCard',
                'amex',
                'discover',
            ],
            gateway: 'adyenv2',
            merchantCapabilities: [
                'supports3DS',
            ],
            merchantId: 'abc',
            paymentsUrl: 'https://bigpay.service.bcdev',
        },
    };
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
