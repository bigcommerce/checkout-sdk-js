import { PaymentMethod } from '../stripev3/stripev3';

import { StripeUPEPaymentMethod } from './stripe-upe';

export function isStripeUPEPaymentMethodLike(
    paymentMethod: PaymentMethod,
): paymentMethod is StripeUPEPaymentMethod {
    return (
        typeof paymentMethod === 'object' &&
        paymentMethod !== null &&
        'initializationData' in paymentMethod &&
        (paymentMethod as StripeUPEPaymentMethod).initializationData !== undefined &&
        (paymentMethod as StripeUPEPaymentMethod).initializationData !== null &&
        typeof (paymentMethod as StripeUPEPaymentMethod).initializationData === 'object' &&
        'stripePublishableKey' in (paymentMethod as StripeUPEPaymentMethod).initializationData &&
        'stripeConnectedAccount' in (paymentMethod as StripeUPEPaymentMethod).initializationData &&
        'shopperLanguage' in (paymentMethod as StripeUPEPaymentMethod).initializationData &&
        typeof (paymentMethod as StripeUPEPaymentMethod).initializationData.stripePublishableKey !==
            'undefined' &&
        typeof (paymentMethod as StripeUPEPaymentMethod).initializationData
            .stripeConnectedAccount !== 'undefined' &&
        typeof (paymentMethod as StripeUPEPaymentMethod).initializationData.shopperLanguage !==
            'undefined'
    );
}
