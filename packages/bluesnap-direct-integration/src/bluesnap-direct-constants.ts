import { HostedFieldType } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BlueSnapDirectHostedFieldTagId as HostedFieldTagId } from './types';

export const BlueSnapHostedFieldType: {
    [HostedFieldTagId.CardNumber]: HostedFieldType.CardNumber;
    [HostedFieldTagId.CardExpiry]: HostedFieldType.CardExpiry;
    [HostedFieldTagId.CardName]: HostedFieldType.CardName;
    [HostedFieldTagId.CardCode]: HostedFieldType.CardCode;
} = {
    [HostedFieldTagId.CardNumber]: HostedFieldType.CardNumber,
    [HostedFieldTagId.CardExpiry]: HostedFieldType.CardExpiry,
    [HostedFieldTagId.CardName]: HostedFieldType.CardName,
    [HostedFieldTagId.CardCode]: HostedFieldType.CardCode,
};

export const CREDIT_CARD_ERRORS = {
    empty: {
        [HostedFieldType.CardNumber]: {
            fieldType: 'cardNumber',
            message: 'Credit card number is required',
            type: 'required',
        },
        [HostedFieldType.CardNumberVerification]: {
            fieldType: 'cardNumber',
            message: 'Credit card number is required',
            type: 'required',
        },
        [HostedFieldType.CardExpiry]: {
            fieldType: 'cardExpiry',
            message: 'Expiration date is required',
            type: 'required',
        },
        [HostedFieldType.CardCode]: {
            fieldType: 'cardCode',
            message: 'CVV is required',
            type: 'required',
        },
        [HostedFieldType.CardCodeVerification]: {
            fieldType: 'cardCode',
            message: 'CVV is required',
            type: 'required',
        },
        [HostedFieldType.CardName]: {
            fieldType: 'cardName',
            message: 'Full name is required',
            type: 'required',
        },
    },
    invalid: {
        [HostedFieldType.CardNumber]: {
            fieldType: 'cardNumber',
            message: 'Credit card number must be valid',
            type: 'invalid_card_number',
        },
        [HostedFieldType.CardNumberVerification]: {
            fieldType: 'cardNumber',
            message: 'Credit card number must be valid',
            type: 'invalid_card_number',
        },
        [HostedFieldType.CardExpiry]: {
            fieldType: 'cardExpiry',
            message: 'Expiration date must be a valid future date in MM / YY format',
            type: 'invalid_card_expiry',
        },
        [HostedFieldType.CardCode]: {
            fieldType: 'cardCode',
            message: 'CVV must be valid',
            type: 'invalid_card_code',
        },
        [HostedFieldType.CardCodeVerification]: {
            fieldType: 'cardCode',
            message: 'CVV must be valid',
            type: 'invalid_card_code',
        },
        [HostedFieldType.CardName]: {
            fieldType: 'cardName',
            message: 'Full name is required',
            type: 'required',
        },
    },
};
