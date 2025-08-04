import isBraintreeError from './is-braintree-error';
import { BraintreeHostedFormError } from '../types';

function isValidInvalidFieldKeys(invalidFieldKeys: unknown): invalidFieldKeys is string[] {
    return (
        Array.isArray(invalidFieldKeys) && invalidFieldKeys.every((key) => typeof key === 'string')
    );
}

export default function isBraintreeHostedFormError(
    error: unknown,
): error is BraintreeHostedFormError {
    if (!isBraintreeError(error)) {
        return false;
    }

    const { details } = error;

    return (
        details === undefined ||
        (typeof details === 'object' &&
            details !== null &&
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (details as { invalidFieldKeys?: unknown }).invalidFieldKeys === undefined) ||
        isValidInvalidFieldKeys(details)
    );
}
