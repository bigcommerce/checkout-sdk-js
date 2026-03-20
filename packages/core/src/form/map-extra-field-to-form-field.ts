import { ExtraField } from './extra-field';
import FormField, { FormFieldFieldType, FormFieldType } from './form-field';

export const B2B_EXTRA_FIELD_PREFIX = 'b2bExtraField_';

export function isExtraFormField(field: FormField): boolean {
    return field.name.startsWith(B2B_EXTRA_FIELD_PREFIX);
}

export function getExtraFieldId(formFieldName: string): number {
    return parseInt(formFieldName.replace(B2B_EXTRA_FIELD_PREFIX, ''), 10);
}

export default function mapExtraFieldToFormField(extraField: ExtraField): FormField {
    const { fieldType, type } = getFieldTypeInfo(extraField.fieldType);

    let options: FormField['options'];

    if (extraField.numberOfRows) {
        options = { rows: extraField.numberOfRows };
    }

    if (extraField.listOfValue?.length) {
        options = {
            ...options,
            items: extraField.listOfValue.map((val) => ({
                value: val,
                label: val,
            })),
        };
    }

    return {
        id: `${B2B_EXTRA_FIELD_PREFIX}${extraField.id}`,
        name: `${B2B_EXTRA_FIELD_PREFIX}${extraField.id}`,
        custom: false,
        label: extraField.labelName,
        required: extraField.isRequired,
        default: extraField.defaultValue,
        fieldType,
        type,
        maxLength: extraField.maximumLength,
        max: extraField.maximumValue,
        options,
    };
}

function getFieldTypeInfo(b2bFieldType: number): {
    fieldType: FormFieldFieldType;
    type: FormFieldType;
} {
    switch (b2bFieldType) {
        case 1:
            return { fieldType: 'multiline', type: 'string' };

        case 2:
            return { fieldType: 'text', type: 'integer' };

        case 3:
            return { fieldType: 'dropdown', type: 'array' };

        case 0:
        default:
            return { fieldType: 'text', type: 'string' };
    }
}
