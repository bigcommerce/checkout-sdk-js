import HostedFieldType from '../hosted-field-type';

import mapToAccessibilityLabel from './map-to-accessibility-label';

describe('mapToAccessibilityLabel()', () => {
    it('returns label for card code input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardCode)).toBe('CVC');
    });

    it('returns label for card expiry input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardExpiry)).toBe('Expiration');
    });

    it('returns label for card name input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardName)).toBe('Name on card');
    });

    it('returns label for card number input', () => {
        expect(mapToAccessibilityLabel(HostedFieldType.CardNumber)).toBe('Credit card number');
    });
});
