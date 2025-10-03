import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

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
