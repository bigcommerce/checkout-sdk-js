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

    it('strips CustomerAddress boolean flags', () => {
        const customerAddress = {
            ...baseAddress,
            isShipping: true,
            isBilling: false,
            isDefaultShipping: true,
            isDefaultBilling: false,
        };

        const result = mapToAddressRequestBody(customerAddress);

        expect(result).toEqual(baseAddress);
        expect(result).not.toHaveProperty('isShipping');
        expect(result).not.toHaveProperty('isBilling');
        expect(result).not.toHaveProperty('isDefaultShipping');
        expect(result).not.toHaveProperty('isDefaultBilling');
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
