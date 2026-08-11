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

    it('keeps all AddressRequestBody fields and defaults shouldSaveAddress to false', () => {
        expect(mapToAddressRequestBody(baseAddress)).toEqual({
            ...baseAddress,
            shouldSaveAddress: false,
        });
    });

    it('keeps extraFields and label when present', () => {
        const address: AddressRequestBody = {
            ...baseAddress,
            label: 'Home',
            extraFields: [{ fieldId: '100', fieldValue: 'Acme' }],
        };

        expect(mapToAddressRequestBody(address)).toEqual({
            ...address,
            shouldSaveAddress: false,
        });
    });

    it('strips flat CustomerAddress B2B fields and keeps top-level extraFields', () => {
        const customerAddress = {
            ...baseAddress,
            extraFields: [{ fieldId: '100', fieldValue: 'Acme' }],
            label: 'Head Office',
            isShipping: true,
            isBilling: false,
            isDefaultShipping: true,
            isDefaultBilling: false,
        };

        const result = mapToAddressRequestBody(customerAddress);

        expect(result).toEqual({
            ...baseAddress,
            extraFields: [{ fieldId: '100', fieldValue: 'Acme' }],
            label: 'Head Office',
            shouldSaveAddress: false,
        });
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
