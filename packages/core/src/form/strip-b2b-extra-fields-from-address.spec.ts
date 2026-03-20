import {
    extractExtraFieldValues,
    stripExtraFieldsFromAddress,
} from './strip-extra-fields-from-address';

describe('stripB2bExtraFieldsFromAddress', () => {
    it('removes B2B extra field keys and preserves standard address fields', () => {
        const formValues = {
            firstName: 'John',
            lastName: 'Doe',
            company: 'ACME',
            address1: '123 Main St',
            address2: '',
            city: 'Springfield',
            stateOrProvince: 'IL',
            stateOrProvinceCode: 'IL',
            countryCode: 'US',
            postalCode: '62701',
            phone: '555-1234',
            customFields: [],
            country: 'United States',
            b2bExtraField_100: 'extra value',
            b2bExtraField_200: 42,
        };

        const result = stripExtraFieldsFromAddress(formValues);

        expect(result).toEqual({
            firstName: 'John',
            lastName: 'Doe',
            company: 'ACME',
            address1: '123 Main St',
            address2: '',
            city: 'Springfield',
            stateOrProvince: 'IL',
            stateOrProvinceCode: 'IL',
            countryCode: 'US',
            postalCode: '62701',
            phone: '555-1234',
            customFields: [],
            country: 'United States',
        });
    });

    it('returns the same shape when no B2B fields are present', () => {
        const formValues = {
            firstName: 'Jane',
            lastName: 'Doe',
            company: '',
            address1: '456 Oak Ave',
            address2: '',
            city: 'Portland',
            stateOrProvince: 'OR',
            stateOrProvinceCode: 'OR',
            countryCode: 'US',
            postalCode: '97201',
            phone: '',
            customFields: [],
            country: 'United States',
        };

        const result = stripExtraFieldsFromAddress(formValues);

        expect(result).toEqual(formValues);
    });
});

describe('extractB2bExtraFieldValues', () => {
    it('extracts B2B extra field values from form values', () => {
        const formValues = {
            firstName: 'John',
            b2bExtraField_100: 'text value',
            b2bExtraField_200: 42,
            lastName: 'Doe',
        };

        const result = extractExtraFieldValues(formValues);

        expect(result).toEqual([
            { fieldId: 100, fieldValue: 'text value' },
            { fieldId: 200, fieldValue: 42 },
        ]);
    });

    it('returns empty array when no B2B fields are present', () => {
        const formValues = {
            firstName: 'John',
            lastName: 'Doe',
        };

        expect(extractExtraFieldValues(formValues)).toEqual([]);
    });
});
