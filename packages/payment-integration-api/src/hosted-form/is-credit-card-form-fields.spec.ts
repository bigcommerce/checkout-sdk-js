import HostedFieldType from './hosted-field-type';
import isCreditCardFormFields from './is-credit-card-form-fields';

describe('isStoredCreditCardFormFields', () => {
    it('returns true if the fields object does not have default credit card form fields', () => {
        expect(
            isCreditCardFormFields({
                [HostedFieldType.CardCode]: { containerId: 'cardCodeContainerId' },
                [HostedFieldType.CardExpiry]: { containerId: 'cardExpiryContainerId' },
                [HostedFieldType.CardName]: { containerId: 'cardNameContainerId' },
                [HostedFieldType.CardNumber]: { containerId: 'cardNumberContainerId' },
            }),
        ).toBe(true);
    });

    it('returns false if the fields object has default credit card form fields', () => {
        expect(
            isCreditCardFormFields({
                [HostedFieldType.CardCodeVerification]: {
                    containerId: 'cardCodeContainerId',
                    instrumentId: 'cardCodeInstrumentId',
                },
                [HostedFieldType.CardNumberVerification]: {
                    containerId: 'cardNumberContainerId',
                    instrumentId: 'cardNumberInstrumentId',
                },
            }),
        ).toBe(false);
    });
});
