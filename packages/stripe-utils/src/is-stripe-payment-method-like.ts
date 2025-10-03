import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { StripePaymentMethod } from './stripe';

export function isStripePaymentMethodLike(
    paymentMethod: PaymentMethod,
): paymentMethod is StripePaymentMethod {
    return (
        typeof paymentMethod === 'object' &&
        paymentMethod !== null &&
        'initializationData' in paymentMethod &&
        (paymentMethod as StripePaymentMethod).initializationData !== undefined &&
        (paymentMethod as StripePaymentMethod).initializationData !== null &&
        typeof (paymentMethod as StripePaymentMethod).initializationData === 'object' &&
        'stripePublishableKey' in (paymentMethod as StripePaymentMethod).initializationData &&
        'stripeConnectedAccount' in (paymentMethod as StripePaymentMethod).initializationData &&
        'shopperLanguage' in (paymentMethod as StripePaymentMethod).initializationData &&
        typeof (paymentMethod as StripePaymentMethod).initializationData.stripePublishableKey !==
            'undefined' &&
        typeof (paymentMethod as StripePaymentMethod).initializationData.stripeConnectedAccount !==
            'undefined' &&
        typeof (paymentMethod as StripePaymentMethod).initializationData.shopperLanguage !==
            'undefined'
    );
}
