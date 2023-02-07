import { HostedFieldType } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapDirectHostedFieldTagId as HostedFieldTagId } from './types';

export const HOSTED_FIELD_TYPES: {
    [HostedFieldTagId.CardNumber]: HostedFieldType.CardNumber;
    [HostedFieldTagId.CardExpiry]: HostedFieldType.CardExpiry;
    [HostedFieldTagId.CardCode]: HostedFieldType.CardCode;
} = Object.freeze({
    [HostedFieldTagId.CardNumber]: HostedFieldType.CardNumber,
    [HostedFieldTagId.CardExpiry]: HostedFieldType.CardExpiry,
    [HostedFieldTagId.CardCode]: HostedFieldType.CardCode,
});

export const CREDIT_CARD_ERRORS = Object.freeze({
    empty: Object.freeze({
        cardNumber: Object.freeze({
            fieldType: 'cardNumber',
            message: 'Credit card number is required',
            type: 'required',
        }),
        cardExpiry: Object.freeze({
            fieldType: 'cardExpiry',
            message: 'Expiration date is required',
            type: 'required',
        }),
        cardCode: Object.freeze({
            fieldType: 'cardCode',
            message: 'CVV is required',
            type: 'required',
        }),
        cardName: Object.freeze({
            fieldType: 'cardName',
            message: 'Full name is required',
            type: 'required',
        }),
    }),
    invalid: Object.freeze({
        cardNumber: Object.freeze({
            fieldType: 'cardNumber',
            message: 'Credit card number must be valid',
            type: 'invalid_card_number',
        }),
        cardExpiry: Object.freeze({
            fieldType: 'cardExpiry',
            message: 'Expiration date must be a valid future date in MM / YY format',
            type: 'invalid_card_expiry',
        }),
        cardCode: Object.freeze({
            fieldType: 'cardCode',
            message: 'CVV must be valid',
            type: 'invalid_card_code',
        }),
    }),
});
