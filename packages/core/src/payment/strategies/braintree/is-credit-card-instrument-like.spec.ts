import { CreditCardInstrument } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { getCreditCardInstrument } from '../../payments.mock';

import isCreditCardInstrumentLike from './is-credit-card-instrument-like';

describe('isCreditCardInstrumentLike', () => {
    const payloadData = getCreditCardInstrument();

    it('returns true if data has a correct type', () => {
        expect(isCreditCardInstrumentLike(payloadData)).toBeTruthy();
    });

    it('returns false if data has a not correct type', () => {
        const partialPayloadData: Partial<CreditCardInstrument> = {
            ...payloadData,
        };

        delete partialPayloadData.ccExpiry;

        expect(isCreditCardInstrumentLike(partialPayloadData)).toBeFalsy();
    });
});
