import { isObject } from 'lodash';

import {
    isWithAccountCreation,
    NonceInstrument,
    WithAccountCreation,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

export type BoltPaymentData = WithAccountCreation & NonceInstrument;

export function isBoltPaymentData(paymentData: unknown): paymentData is BoltPaymentData {
    return Boolean(
        isObject(paymentData) &&
            ('shouldSaveInstrument' in paymentData ||
                'nonce' in paymentData ||
                isWithAccountCreation(paymentData)),
    );
}
