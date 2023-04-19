import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayStripeTokenObject } from '../types';

function isGooglePayStripeTokenObject(token: unknown): token is GooglePayStripeTokenObject {
    return typeof token === 'object' && token !== null && 'id' in token;
}

export default function assertIsGooglePayStripeTokenObject(
    token: unknown,
): asserts token is GooglePayStripeTokenObject {
    if (!isGooglePayStripeTokenObject(token)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
    }
}
