import {
    MissingDataError,
    MissingDataErrorType,
    PaymentMethod,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayInitializationData, GooglePayPayPalCommerceInitializationData } from '../types';

function isGooglePayPaypalCommercePaymentMethod(
    data: PaymentMethod<GooglePayInitializationData>,
): data is PaymentMethod<GooglePayPayPalCommerceInitializationData> {
    if (data.initializationData) {
        return (
            'attributionId' in data.initializationData &&
            'isVenmoEnabled' in data.initializationData &&
            'isGooglePayEnabled' in data.initializationData &&
            'isPayPalCreditAvailable' in data.initializationData
        );
    }

    return false;
}

export default function assertsIsGooglePayPayPalCommercePaymentMethod(
    data: PaymentMethod<GooglePayInitializationData>,
): asserts data is PaymentMethod<GooglePayPayPalCommerceInitializationData> {
    if (!isGooglePayPaypalCommercePaymentMethod(data)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
    }
}
