import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayCheckoutComInitializationData, GooglePayInitializationData } from '../types';

function isGooglePayCheckoutComInitializationData(
    data: GooglePayInitializationData,
): data is GooglePayCheckoutComInitializationData {
    return 'checkoutcomkey' in data;
}

export default function assertIsGooglePayCheckoutComInitializationData(
    data: GooglePayInitializationData,
): asserts data is GooglePayCheckoutComInitializationData {
    if (!isGooglePayCheckoutComInitializationData(data)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
    }
}
