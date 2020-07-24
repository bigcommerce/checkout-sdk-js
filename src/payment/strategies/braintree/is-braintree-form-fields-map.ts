import { BraintreeFormFieldsMap, BraintreeStoredCardFieldsMap } from './braintree-payment-options';

export function isBraintreeFormFieldsMap(
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap
): fields is BraintreeFormFieldsMap {
    return !!(fields as BraintreeFormFieldsMap).cardNumber;
}

export function isBraintreeStoredCardFieldsMap(
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap
): fields is BraintreeStoredCardFieldsMap {
    return !!(
        (fields as BraintreeStoredCardFieldsMap).cardCodeVerification ||
        (fields as BraintreeStoredCardFieldsMap).cardNumberVerification
    );
}
