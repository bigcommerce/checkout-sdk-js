import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayInitializationData } from '../types';

export function getCheckoutCom(): PaymentMethod<GooglePayInitializationData> {
    const generic = getGeneric();

    return {
        ...generic,
        initializationData: {
            ...generic.initializationData!,
            checkoutcomkey: 'pk_f00-b4r',
        },
    };
}

export function getStripe(): PaymentMethod<GooglePayInitializationData> {
    const generic = getGeneric();

    return {
        ...generic,
        initializationData: {
            ...generic.initializationData!,
            stripeConnectedAccount: 'acct_f00b4r',
            stripePublishableKey: 'pk_live_f00b4r',
            stripeVersion: '2026-02-31',
        },
    };
}

export function getAuthorizeNet(): PaymentMethod<GooglePayInitializationData> {
    const generic = getGeneric();

    return {
        ...generic,
        initializationData: {
            ...generic.initializationData!,
            gatewayMerchantId: undefined,
            paymentGatewayId: generic.initializationData!.gatewayMerchantId,
        },
    };
}

export function getGeneric(): PaymentMethod<GooglePayInitializationData> {
    return {
        id: 'googlepayexample',
        method: 'googlepay',
        supportedCards: ['AMEX', 'DISCOVER', 'JCB', 'VISA', 'MC'],
        config: {
            displayName: 'Google Pay',
            testMode: true,
        },
        type: 'PAYMENT_TYPE_API',
        initializationData: {
            gateway: 'does_not_matter',
            gatewayMerchantId: 'exampleGatewayMerchantId',
            googleMerchantId: '12345678901234567890',
            googleMerchantName: 'Example Merchant',
            isThreeDSecureEnabled: false,
            platformToken: 'foo.bar.baz',
            storeCountry: 'US',
        },
    };
}
