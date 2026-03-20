import { ExtraField } from './extra-field';
import mapExtraFieldToFormField, {
    B2B_EXTRA_FIELD_PREFIX,
    getExtraFieldId,
    isExtraFormField,
} from './map-extra-field-to-form-field';

describe('mapB2bExtraFieldToFormField', () => {
    it('maps a text field (fieldType 0)', () => {
        const extraField: ExtraField = {
            id: 100,
            fieldName: 'textField',
            fieldType: 0,
            isRequired: true,
            visibleToEnduser: true,
            defaultValue: 'hello',
            labelName: 'Text Field',
            maximumLength: 50,
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

    it('maps a multiline field (fieldType 1)', () => {
        const extraField: ExtraField = {
            id: 200,
            fieldName: 'multilineField',
            fieldType: 1,
            isRequired: false,
            visibleToEnduser: true,
            defaultValue: 'multi',
            labelName: 'Multiline Field',
            numberOfRows: 5,
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

    it('maps a number field (fieldType 2)', () => {
        const extraField: ExtraField = {
            id: 300,
            fieldName: 'numberField',
            fieldType: 2,
            isRequired: true,
            visibleToEnduser: true,
            defaultValue: '42',
            labelName: 'Number Field',
            maximumValue: 1000,
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

    it('defaults unknown fieldType to text/string', () => {
        const extraField: ExtraField = {
            id: 400,
            fieldName: 'unknown',
            fieldType: 99,
            isRequired: false,
            visibleToEnduser: true,
            defaultValue: '',
            labelName: 'Unknown',
        };

        const result = mapExtraFieldToFormField(extraField);

        expect(result.fieldType).toBe('text');
        expect(result.type).toBe('string');
    });
});

describe('isB2bExtraFormField', () => {
    it('returns true for B2B extra form fields', () => {
        expect(
            isExtraFormField({
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
            isExtraFormField({
                id: 'field_4',
                name: 'firstName',
                custom: false,
                label: 'First Name',
                required: true,
            }),
        ).toBe(false);
    });
});

describe('getB2bExtraFieldId', () => {
    it('extracts the numeric ID from the prefixed name', () => {
        expect(getExtraFieldId(`${B2B_EXTRA_FIELD_PREFIX}123`)).toBe(123);
    });
});
