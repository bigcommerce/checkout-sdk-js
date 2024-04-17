import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    GooglePayAdyenV2InitializationData,
    GooglePayAdyenV3InitializationData,
    GooglePayInitializationData,
} from '../types';

function isGooglePayAdyenV2InitializationData(
    data: GooglePayInitializationData,
): data is GooglePayAdyenV2InitializationData {
    return ('originKey' in data || 'clientKey' in data) && 'paymentMethodsResponse' in data;
}

function isGooglePayAdyenV3InitializationData(
    data: GooglePayInitializationData,
): data is GooglePayAdyenV3InitializationData {
    return 'clientKey' in data && 'paymentMethodsResponse' in data;
}

export function assertsIsGooglePayAdyenV2InitializationData(
    data: GooglePayInitializationData,
): asserts data is GooglePayAdyenV2InitializationData {
    if (!isGooglePayAdyenV2InitializationData(data)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
    }
}

export function assertsIsGooglePayAdyenV3InitializationData(
    data: GooglePayInitializationData,
): asserts data is GooglePayAdyenV3InitializationData {
    if (!isGooglePayAdyenV3InitializationData(data)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
    }
}
