import { isObject } from 'lodash';

import { isWithAccountCreation } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { BoltPaymentData } from './bolt';

export function isBoltPaymentData(paymentData: unknown): paymentData is BoltPaymentData {
    return Boolean(
        isObject(paymentData) &&
            ('shouldSaveInstrument' in paymentData ||
                'nonce' in paymentData ||
                isWithAccountCreation(paymentData)),
    );
}
