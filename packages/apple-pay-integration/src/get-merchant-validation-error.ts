import { isRequestError } from '@bigcommerce/checkout-sdk/payment-integration-api';

import ApplePayMerchantNotAuthorizedError from './errors/apple-pay-merchant-not-authorized-error';

const MERCHANT_VALIDATION_FAILED_MESSAGE = 'Merchant validation failed';

// Merchant validation responds with 417 when the merchant ID is not authorized
// for the root merchant ID (Mass Enablement / WWDR registration issue).
const MERCHANT_NOT_AUTHORIZED_STATUS = 417;

export default function getMerchantValidationError(error: unknown): Error {
    if (isRequestError(error) && error.status === MERCHANT_NOT_AUTHORIZED_STATUS) {
        return new ApplePayMerchantNotAuthorizedError();
    }

    return new Error(MERCHANT_VALIDATION_FAILED_MESSAGE);
}
