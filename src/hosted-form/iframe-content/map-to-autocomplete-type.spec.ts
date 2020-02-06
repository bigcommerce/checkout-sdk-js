import HostedFieldType from '../hosted-field-type';

import mapToAutocompleteType from './map-to-autocomplete-type';

describe('mapToAutocompleteType()', () => {
    it('returns autocomplete type for card code input', () => {
        expect(mapToAutocompleteType(HostedFieldType.CardCode))
            .toEqual('cc-csc');
    });

    it('returns autocomplete type for card expiry input', () => {
        expect(mapToAutocompleteType(HostedFieldType.CardExpiry))
            .toEqual('cc-exp');
    });

    it('returns autocomplete type for card name input', () => {
        expect(mapToAutocompleteType(HostedFieldType.CardName))
            .toEqual('cc-name');
    });

    it('returns autocomplete type for card number input', () => {
        expect(mapToAutocompleteType(HostedFieldType.CardNumber))
            .toEqual('cc-number');
    });
});
