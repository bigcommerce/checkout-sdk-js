import { BraintreeFormFieldsMap, BraintreeStoredCardFieldsMap } from '../index';

export function isBraintreeFormFieldsMap(
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap,
): fields is BraintreeFormFieldsMap {
    return 'cardNumber' in fields;
}

export function isBraintreeStoredCardFieldsMap(
    fields: BraintreeFormFieldsMap | BraintreeStoredCardFieldsMap,
): fields is BraintreeStoredCardFieldsMap {
    return !!(
        Object.keys(fields).length > 0 &&
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        ((fields as BraintreeStoredCardFieldsMap).cardCodeVerification ||
            // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
            (fields as BraintreeStoredCardFieldsMap).cardNumberVerification)
    );
}
