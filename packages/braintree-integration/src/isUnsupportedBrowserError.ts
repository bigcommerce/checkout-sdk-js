import { UnsupportedBrowserError } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function isUnsupportedBrowserError(error: any): error is UnsupportedBrowserError {
    return error instanceof UnsupportedBrowserError;
}
