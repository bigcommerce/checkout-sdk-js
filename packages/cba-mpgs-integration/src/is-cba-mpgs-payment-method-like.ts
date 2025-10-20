/* eslint-disable @typescript-eslint/consistent-type-assertions */
import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { CBAMPGSPaymentMethod, ThreeDSErrorBody } from './cba-mpgs';

export function isCBAMPGSPaymentMethodLike(
    paymentMethod: PaymentMethod,
): paymentMethod is CBAMPGSPaymentMethod {
    return (
        typeof paymentMethod === 'object' &&
        paymentMethod !== null &&
        'initializationData' in paymentMethod &&
        typeof (paymentMethod as CBAMPGSPaymentMethod).initializationData === 'object' &&
        (paymentMethod as CBAMPGSPaymentMethod).initializationData !== null &&
        'merchantId' in (paymentMethod as CBAMPGSPaymentMethod).initializationData &&
        typeof (paymentMethod as CBAMPGSPaymentMethod).initializationData.merchantId === 'string' &&
        (typeof (paymentMethod as CBAMPGSPaymentMethod).initializationData.isTestModeFlagEnabled ===
            'boolean' ||
            typeof (paymentMethod as CBAMPGSPaymentMethod).initializationData
                .isTestModeFlagEnabled === 'undefined')
    );
}

export function isThreeDSErrorBody(body: unknown): body is ThreeDSErrorBody {
    return (
        typeof body === 'object' &&
        body !== null &&
        'three_ds_result' in body &&
        typeof (body as ThreeDSErrorBody).three_ds_result === 'object' &&
        (body as ThreeDSErrorBody).three_ds_result !== null &&
        'token' in (body as ThreeDSErrorBody).three_ds_result &&
        typeof (body as ThreeDSErrorBody).three_ds_result.token === 'string'
    );
}
