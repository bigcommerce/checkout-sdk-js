import { getAmazonPayV2 } from '@bigcommerce/checkout-sdk/amazon-pay-utils';
import { DefaultCheckoutButtonHeight } from '@bigcommerce/checkout-sdk/payment-integration-api';

import PaymentMethod from './payment-method';
import PaymentMethodState from './payment-method-state';
import { PaypalButtonStyleColorOption } from './strategies/paypal';

export function getBraintree(): PaymentMethod {
    return {
        id: 'braintree',
        clientToken: 'clientToken',
        logoUrl:
            'https://cdn.bcapp.dev/rHEAD/modules/checkout/braintree/images/paypal_powered_braintree_horizontal.png',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
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
            isAcceleratedCheckoutEnabled: false,
            merchantAccountId: '100000',
            paymentButtonStyles: {
                checkoutTopButtonStyles: {
                    color: PaypalButtonStyleColorOption.BLUE,
                    label: 'checkout',
                    height: DefaultCheckoutButtonHeight,
                },
            },
        },
        skipRedirectConfirmationAlert: false,
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
            enableCheckoutPaywallBanner: false,
            paymentButtonStyles: {
                checkoutTopButtonStyles: {
                    color: PaypalButtonStyleColorOption.BLUE,
                    label: 'checkout',
                    height: DefaultCheckoutButtonHeight,
                },
            },
        },
        skipRedirectConfirmationAlert: false,
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
            paymentButtonStyles: {
                checkoutTopButtonStyles: {
                    color: PaypalButtonStyleColorOption.BLUE,
                    label: 'checkout',
                    height: DefaultCheckoutButtonHeight,
                },
            },
        },
        skipRedirectConfirmationAlert: false,
    };
}

export function getBraintreeVisaCheckout(): PaymentMethod {
    return {
        id: 'braintreevisacheckout',
        clientToken: 'clientToken',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        config: {
            testMode: false,
            isVisaCheckoutEnabled: true,
        },
        initializationData: {},
        type: 'PAYMENT_TYPE_API',
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
    };
}

export function getPaypalCommerce(): PaymentMethod {
    return {
        id: 'paypalcommerce',
        logoUrl: '',
        method: 'paypal',
        supportedCards: [],
        clientToken: 'asdcvY7XFSQasd',
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
            merchantId: 'JTS4DY7XFSQZE',
            orderId: '3U4171152W1482642',
            attributionId: '1123JLKJASD12',
            intent: 'capture',
            isPayPalCreditAvailable: false,
            isVenmoEnabled: false,
            shouldRenderFields: true,
            isHostedCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: true,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: true,
    };
}

export function getStripe(): PaymentMethod {
    return {
        id: 'stripe',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
        config: {
            displayName: 'Credit Card',
            cardCode: true,
            enablePaypal: true,
            merchantId: '',
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
        skipRedirectConfirmationAlert: true,
    };
}

export function getSquare(): PaymentMethod {
    return {
        id: 'square',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
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
        skipRedirectConfirmationAlert: false,
    };
}

export function getWepay(): PaymentMethod {
    return {
        id: 'wepay',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: ['VISA', 'MC', 'AMEX', 'DISCOVER', 'JCB', 'DINERS'],
        config: {
            displayName: 'Credit Card',
            enablePaypal: false,
            merchantId: '',
            testMode: true,
            isVisaCheckoutEnabled: false,
        },
        type: 'PAYMENT_TYPE_API',
        skipRedirectConfirmationAlert: false,
    };
}

export function getGooglePay(): PaymentMethod {
    return {
        id: 'googlepay',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: ['VISA', 'MC', 'AMEX'],
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
        skipRedirectConfirmationAlert: false,
    };
}

export function getGooglePayAdyenV2(): PaymentMethod {
    return {
        id: 'googlepayadyenv2',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: ['VISA', 'MC', 'AMEX'],
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
        skipRedirectConfirmationAlert: true,
    };
}

export function getGooglePayAdyenV3(): PaymentMethod {
    return {
        id: 'googlepayadyenv3',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: ['VISA', 'MC', 'AMEX'],
        config: {
            displayName: 'Google Pay',
            merchantId: '',
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        initializationData: {
            clientKey: 'YOUR_CLIENT_KEY',
            nonce: 'nonce',
            card_information: {
                type: 'MasterCard',
                number: '4111',
            },
        },
        skipRedirectConfirmationAlert: true,
    };
}

export function getGooglePayCybersourceV2(): PaymentMethod {
    return {
        id: 'googlepaycybersourcev2',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: ['VISA', 'MC', 'AMEX'],
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
        skipRedirectConfirmationAlert: true,
    };
}

export function getGooglePayOrbital(): PaymentMethod {
    return {
        id: 'googlepayorbital',
        logoUrl: '',
        method: 'googlepay',
        supportedCards: ['VISA', 'MC', 'AMEX'],
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: true,
    };
}

export function getStripeV3(
    method = 'card',
    shouldUseIndividualCardFields = false,
    isHostedFormEnabled = false,
): PaymentMethod {
    return {
        id: method,
        gateway: 'stripev3',
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
            bopis: {
                enabled: false,
                requiredAddress: 'none',
            },
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        returnUrl: 'http://www.example.com',
        skipRedirectConfirmationAlert: true,
    };
}

export function getStripeUPE(method = 'card'): PaymentMethod {
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
        skipRedirectConfirmationAlert: true,
    };
}

export function getAdyenV3(method = 'scheme'): PaymentMethod {
    return {
        id: 'adyenv3',
        logoUrl: '',
        method,
        supportedCards: [],
        config: {
            displayName: 'Adyen',
            merchantId: 'YOUR_MERCHANT_ID',
            testMode: true,
        },
        initializationData: {
            clientKey: 'YOUR_CLIENT_KEY',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
        skipRedirectConfirmationAlert: true,
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
        skipRedirectConfirmationAlert: false,
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
        skipRedirectConfirmationAlert: true,
    };
}

export function getMollie(): PaymentMethod {
    return {
        id: 'mollie',
        gateway: '',
        logoUrl:
            'https://charlsieremade-cloud-dev-vm.store.bcdev/rHEAD/modules/checkout/mollie/images/mollie.png',
        method: 'multi-options',
        supportedCards: ['VISA', 'AMEX', 'MC', 'MAESTRO'],
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
        initializationData: {
            locale: 'en-US',
        },
        type: 'PAYMENT_TYPE_API',
        skipRedirectConfirmationAlert: true,
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
        skipRedirectConfirmationAlert: false,
    };
}

export function getCBAMPGS(): PaymentMethod {
    return {
        id: 'cba_mpgs',
        gateway: '',
        logoUrl: '',
        method: 'credit-card',
        supportedCards: [],
        clientToken: 'foo',
        config: {
            displayName: 'CBA MPGS',
            is3dsEnabled: true,
            testMode: false,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            isTestModeFlagEnabled: false,
            merchantId: 'ABC123',
        },
        skipRedirectConfirmationAlert: true,
    };
}

export function getPaymentMethods(): PaymentMethod[] {
    return [
        getAdyenAmex(),
        getAffirm(),
        getAmazonPayV2(),
        getAuthorizenet(),
        getBlueSnapV2(),
        getBraintree(),
        getBraintreePaypal(),
        getBraintreePaypalCredit(),
        getBraintreeVisaCheckout(),
        getCheckoutcom(),
        getGooglePay(),
        getGooglePayAdyenV2(),
        getGooglePayCybersourceV2(),
        getGooglePayOrbital(),
        getHumm(),
        getKlarna(),
        getMollie(),
        getMoneris(),
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
            supportedNetworks: ['visa', 'masterCard', 'amex', 'discover'],
            gateway: 'adyenv2',
            merchantCapabilities: ['supports3DS'],
            merchantId: 'abc',
            paymentsUrl: 'https://bigpay.service.bcdev',
        },
        skipRedirectConfirmationAlert: true,
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
