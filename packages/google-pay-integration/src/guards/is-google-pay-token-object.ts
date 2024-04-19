import {
    MissingDataError,
    MissingDataErrorType,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayTokenObject } from '../types';

function isGooglePayTokenObject(token: unknown): token is GooglePayTokenObject {
    return (
        typeof token === 'object' &&
        token !== null &&
        'protocolVersion' in token &&
        'signature' in token &&
        'signedMessage' in token
    );
}

export default function assertIsGooglePayTokenObject(
    token: unknown,
): asserts token is GooglePayTokenObject {
    if (!isGooglePayTokenObject(token)) {
        throw new MissingDataError(MissingDataErrorType.MissingPaymentToken);
    }
}
