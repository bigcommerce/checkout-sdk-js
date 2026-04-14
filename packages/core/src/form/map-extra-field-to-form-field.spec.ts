import { ExtraField } from './extra-field';
import mapExtraFieldToFormField, { isExtraField } from './map-extra-field-to-form-field';

describe('mapB2bExtraFieldToFormField', () => {
    it('maps a text field', () => {
        const extraField: ExtraField = {
            id: '100',
            name: 'Text Field',
            type: 'text',
            isRequired: true,
            config: { defaultValue: 'hello', maxLength: 50 },
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result).toEqual({
            id: 'b2bExtraField_100',
            name: 'b2bExtraField_100',
            custom: false,
            label: 'Text Field',
            required: true,
            default: 'hello',
            fieldType: 'text',
            type: 'string',
            maxLength: 50,
            max: undefined,
            options: undefined,
        });
    });

    it('maps a multiline text field', () => {
        const extraField: ExtraField = {
            id: '200',
            name: 'Multiline Field',
            type: 'multiline_text',
            isRequired: false,
            config: { defaultValue: 'multi', numberOfRows: 5 },
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result).toEqual({
            id: 'b2bExtraField_200',
            name: 'b2bExtraField_200',
            custom: false,
            label: 'Multiline Field',
            required: false,
            default: 'multi',
            fieldType: 'multiline',
            type: 'string',
            maxLength: undefined,
            max: undefined,
            options: { rows: 5 },
        });
    });

    it('maps a number field', () => {
        const extraField: ExtraField = {
            id: '300',
            name: 'Number Field',
            type: 'number',
            isRequired: true,
            config: { defaultValue: 42, maxValue: 1000 },
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result).toEqual({
            id: 'b2bExtraField_300',
            name: 'b2bExtraField_300',
            custom: false,
            label: 'Number Field',
            required: true,
            default: '42',
            fieldType: 'text',
            type: 'integer',
            maxLength: undefined,
            max: 1000,
            options: undefined,
        });
    });

    it('maps a dropdown field', () => {
        const extraField: ExtraField = {
            id: '400',
            name: 'Dropdown Field',
            type: 'dropdown',
            isRequired: true,
            config: { options: ['A', 'B', 'C'] },
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result).toEqual({
            id: 'b2bExtraField_400',
            name: 'b2bExtraField_400',
            custom: false,
            label: 'Dropdown Field',
            required: true,
            default: undefined,
            fieldType: 'dropdown',
            type: 'array',
            maxLength: undefined,
            max: undefined,
            options: {
                items: [
                    { value: 'A', label: 'A' },
                    { value: 'B', label: 'B' },
                    { value: 'C', label: 'C' },
                ],
            },
        });
    });
});

describe('defaultValue coercion', () => {
    it('stringifies a numeric defaultValue', () => {
        const extraField: ExtraField = {
            id: '500',
            name: 'Numeric Default',
            type: 'number',
            isRequired: false,
            config: { defaultValue: 0, maxValue: 100 },
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result.default).toBe('0');
    });

    it('passes through a string defaultValue as-is', () => {
        const extraField: ExtraField = {
            id: '501',
            name: 'String Default',
            type: 'text',
            isRequired: false,
            config: { defaultValue: 'preset' },
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result.default).toBe('preset');
    });

    it('returns undefined when config has no defaultValue', () => {
        const extraField: ExtraField = {
            id: '502',
            name: 'No Default',
            type: 'dropdown',
            isRequired: false,
            config: { options: ['X', 'Y'] },
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result.default).toBeUndefined();
    });
});

describe('isB2bExtraField', () => {
    it('returns true for B2B extra fields', () => {
        expect(
            isExtraField({
                id: 'b2bExtraField_100',
                name: 'b2bExtraField_100',
                custom: false,
                label: 'Test',
                required: false,
            }),
        ).toBe(true);
    });

    it('returns false for regular form fields', () => {
        expect(
            isExtraField({
                id: 'field_4',
                name: 'firstName',
                custom: false,
                label: 'First Name',
                required: true,
            }),
        ).toBe(false);
    });
});
