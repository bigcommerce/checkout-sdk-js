import { BraintreeHostedFormError } from './braintree';
import { isBraintreeError } from './utils';

function isValidInvalidFieldKeys(invalidFieldKeys: any): invalidFieldKeys is string[] {
    return (
        Array.isArray(invalidFieldKeys) && invalidFieldKeys.every((key) => typeof key === 'string')
    );
}

export function isBraintreeHostedFormError(error: any): error is BraintreeHostedFormError {
    if (!isBraintreeError(error)) {
        return false;
    }

    const { details } = error;

    return (
        details === undefined ||
        (typeof details === 'object' &&
            details !== null &&
            (details as { invalidFieldKeys?: unknown }).invalidFieldKeys === undefined) ||
        isValidInvalidFieldKeys((details as { invalidFieldKeys?: unknown }).invalidFieldKeys)
    );
}
