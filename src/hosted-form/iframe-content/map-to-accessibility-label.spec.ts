import HostedFieldType from '../hosted-field-type';

import mapToAccessibilityLabel from './map-to-accessibility-label';

describe('mapToAccessibilityLabel()', () => {
    it('returns label for card code input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardCode))
            .toEqual('CVC');
    });

    it('returns label for card expiry input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardExpiry))
            .toEqual('Expiration');
    });

    it('returns label for card name input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardName))
            .toEqual('Name on card');
    });

    it('returns label for card number input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardNumber))
            .toEqual('Credit card number');
    });
});
