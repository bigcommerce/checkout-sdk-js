import { BraintreeFormFieldsMap, BraintreeStoredCardFieldsMap } from '@bigcommerce/checkout-sdk/braintree-utils';

export function isBraintreeFormFieldsMap(
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap,
): fields is BraintreeFormFieldsMap {
    return !!(fields as BraintreeFormFieldsMap).cardNumber;
}

export default function isBraintreeStoredCardFieldsMap(
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap,
): fields is BraintreeStoredCardFieldsMap {
    return !!(
        (fields as BraintreeStoredCardFieldsMap).cardCodeVerification ||
        (fields as BraintreeStoredCardFieldsMap).cardNumberVerification
    );
}
