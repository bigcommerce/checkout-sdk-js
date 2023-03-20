import HostedFieldType from './hosted-field-type';
import isStoredCreditCardFormFields from './is-stored-credit-card-form-fields';

describe('isStoredCreditCardFormFields', () => {
    it('returns true if the fields object does not have default credit card form fields', () => {
        expect(
            isStoredCreditCardFormFields({
                [HostedFieldType.CardCodeVerification]: {
                    containerId: 'cardCodeContainerId',
                    instrumentId: 'cardCodeInstrumentId',
                },
                [HostedFieldType.CardNumberVerification]: {
                    containerId: 'cardNumberContainerId',
                    instrumentId: 'cardNumberInstrumentId',
                },
            }),
        ).toBe(true);
    });

    it('returns false if the fields object has default credit card form fields', () => {
        expect(
            isStoredCreditCardFormFields({
                [HostedFieldType.CardCode]: { containerId: 'cardCodeContainerId' },
                [HostedFieldType.CardExpiry]: { containerId: 'cardExpiryContainerId' },
                [HostedFieldType.CardName]: { containerId: 'cardNameContainerId' },
                [HostedFieldType.CardNumber]: { containerId: 'cardNumberContainerId' },
            }),
        ).toBe(false);
    });
});
