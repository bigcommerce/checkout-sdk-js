import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';
import { CBAMPGSPaymentMethod } from './cba-mpgs';

export function isCBAMPGSPaymentMethodLike(
    paymentMethod: PaymentMethod,
): paymentMethod is CBAMPGSPaymentMethod {
    return (
        typeof paymentMethod === 'object' &&
        paymentMethod !== null &&
        'initializationData' in paymentMethod &&
        typeof (paymentMethod as any).initializationData === 'object' &&
        (paymentMethod as any).initializationData !== null &&
        'merchantId' in (paymentMethod as any).initializationData &&
        typeof (paymentMethod as any).initializationData.merchantId === 'string' &&
        (
            (typeof (paymentMethod as any).initializationData.isTestModeFlagEnabled === 'boolean') ||
            typeof (paymentMethod as any).initializationData.isTestModeFlagEnabled === 'undefined'
        )
    );
}
