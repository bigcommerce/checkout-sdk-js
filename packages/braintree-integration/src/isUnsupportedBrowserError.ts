import { UnsupportedBrowserError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function isUnsupportedBrowserError(error: unknown): error is UnsupportedBrowserError {
    return error instanceof UnsupportedBrowserError;
}
