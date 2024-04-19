import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayBraintreeTokenObject } from '../types';

function isGooglePayBraintreeTokenObject(token: unknown): token is GooglePayBraintreeTokenObject {
    return typeof token === 'object' && token !== null && 'androidPayCards' in token;
}

export default function assertIsGooglePayBraintreeTokenObject(
    token: unknown,
): asserts token is GooglePayBraintreeTokenObject {
    if (!isGooglePayBraintreeTokenObject(token)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
    }
}
