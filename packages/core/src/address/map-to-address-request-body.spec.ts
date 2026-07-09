import { AddressRequestBody } from './address';
import mapToAddressRequestBody from './map-to-address-request-body';

describe('mapToAddressRequestBody()', () => {
    const baseAddress: AddressRequestBody = {
        firstName: 'Test',
        lastName: 'Tester',
        company: 'BigCommerce',
        address1: '12345 Testing Way',
        address2: '',
        city: 'Some City',
        stateOrProvince: 'California',
        stateOrProvinceCode: 'CA',
        countryCode: 'US',
        postalCode: '95555',
        phone: '555-555-5555',
        customFields: [],
    };

    it('keeps all AddressRequestBody fields', () => {
        expect(mapToAddressRequestBody(baseAddress)).toEqual(baseAddress);
    });

    it('keeps extraFields and label when present', () => {
        const address: AddressRequestBody = {
            ...baseAddress,
            label: 'Home',
            extraFields: [{ fieldId: '100', fieldValue: 'Acme' }],
        };

        expect(mapToAddressRequestBody(address)).toEqual(address);
    });

    it('strips CustomerAddress b2b metadata and hoists extraFields', () => {
        const customerAddress = {
            ...baseAddress,
            b2b: {
                isShipping: true,
                isBilling: false,
                isDefaultShipping: true,
                isDefaultBilling: false,
                label: 'Head Office',
                extraFields: [{ fieldId: '100', fieldValue: 'Acme' }],
            },
        };

        const result = mapToAddressRequestBody(customerAddress);

        expect(result).toEqual({
            ...baseAddress,
            extraFields: [{ fieldId: '100', fieldValue: 'Acme' }],
        });
        expect(result).not.toHaveProperty('b2b');
        expect(result).not.toHaveProperty('label');
    });

    it('does not overwrite top-level extraFields with b2b values', () => {
        const customerAddress = {
            ...baseAddress,
            extraFields: [{ fieldId: '200', fieldValue: 'Explicit' }],
            b2b: {
                isShipping: true,
                isBilling: false,
                isDefaultShipping: true,
                isDefaultBilling: false,
                label: 'Head Office',
                extraFields: [{ fieldId: '100', fieldValue: 'Acme' }],
            },
        };

        const result = mapToAddressRequestBody(customerAddress);

        expect(result).toHaveProperty('extraFields', [{ fieldId: '200', fieldValue: 'Explicit' }]);
    });

    it('preserves id and type', () => {
        const addressWithMetadata = {
            ...baseAddress,
            id: 12,
            type: 'residential',
        };

        const result = mapToAddressRequestBody(addressWithMetadata);

        expect(result).toHaveProperty('id', 12);
        expect(result).toHaveProperty('type', 'residential');
    });

    it('preserves country and shouldSaveAddress', () => {
        const result = mapToAddressRequestBody({
            ...baseAddress,
            country: 'United States',
            shouldSaveAddress: true,
        });

        expect(result).toHaveProperty('country', 'United States');
        expect(result).toHaveProperty('shouldSaveAddress', true);
    });
});
