import { RequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { GooglePayThreeDSecureResult } from '../types';

export function isGooglePayThreeDSecureResult(
    body: RequestError['body'],
): body is GooglePayThreeDSecureResult {
    if (typeof body !== 'object' || body === null) {
        return false;
    }

    const threeDSBody = body as Partial<GooglePayThreeDSecureResult>;

    return (
        typeof threeDSBody.three_ds_result?.acs_url === 'string' &&
        typeof threeDSBody.three_ds_result.code === 'string'
    );
}
