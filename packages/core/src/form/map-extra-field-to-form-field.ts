import { ExtraField, ExtraFieldType } from './extra-field';
import FormField, { FormFieldFieldType, FormFieldType } from './form-field';

export const B2B_EXTRA_FIELD_PREFIX = 'b2bExtraField_';

export function isExtraField(field: FormField): boolean {
    return field.name.startsWith(B2B_EXTRA_FIELD_PREFIX);
}

export default function mapExtraFieldToFormField(extraField: ExtraField): FormField {
    const { fieldType, type } = getFieldTypeInfo(extraField.type);

    let options: FormField['options'];

    if (extraField.config.numberOfRows) {
        options = { rows: extraField.config.numberOfRows };
    }

    if (extraField.config.options?.length) {
        options = {
            ...options,
            items: extraField.config.options.map((val) => ({
                value: val,
                label: val,
            })),
        };
    }

    return {
        id: `${B2B_EXTRA_FIELD_PREFIX}${extraField.id}`,
        name: `${B2B_EXTRA_FIELD_PREFIX}${extraField.id}`,
        custom: false,
        label: extraField.name,
        hidden: !extraField.visibleToEnduser,
        required: extraField.isRequired,
        default:
            extraField.config.defaultValue != null
                ? String(extraField.config.defaultValue)
                : undefined,
        fieldType,
        type,
        maxLength: extraField.config.maxLength,
        max: extraField.config.maxValue,
        options,
    };
}

function getFieldTypeInfo(extraFieldType: ExtraFieldType): {
    fieldType: FormFieldFieldType;
    type: FormFieldType;
} {
    switch (extraFieldType) {
        case 'multiline_text':
            return { fieldType: 'multiline', type: 'string' };

        case 'number':
            return { fieldType: 'text', type: 'integer' };

        case 'dropdown':
            return { fieldType: 'dropdown', type: 'array' };

        case 'text':
        default:
            return { fieldType: 'text', type: 'string' };
    }
}
