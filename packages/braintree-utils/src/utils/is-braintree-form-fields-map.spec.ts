import { isBraintreeStoredCardFieldsMap } from './is-braintree-form-fields-map';
import { BraintreeFormFieldType, BraintreeStoredCardFieldsMap } from '../index';

describe('isBraintreeStoredCardFieldsMap', () => {
    it('returns true if fields belong to stored card', () => {
        const fields: BraintreeStoredCardFieldsMap = {
            [BraintreeFormFieldType.CardCodeVerification]: {
                instrumentId: 'instrumentId',
                containerId: 'containerId',
            },
        };

        expect(isBraintreeStoredCardFieldsMap(fields)).toBe(true);
    });
});
