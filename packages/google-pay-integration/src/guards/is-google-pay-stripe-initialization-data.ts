import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayInitializationData, GooglePayStripeInitializationData } from '../types';

function isGooglePayStripeInitializationData(
    data: GooglePayInitializationData,
): data is GooglePayStripeInitializationData {
    return (
        'stripeConnectedAccount' in data &&
        'stripePublishableKey' in data &&
        'stripeVersion' in data
    );
}

export default function assertsIsGooglePayStripeInitializationData(
    data: GooglePayInitializationData,
): asserts data is GooglePayStripeInitializationData {
    if (!isGooglePayStripeInitializationData(data)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentMethod);
    }
}
