import { AddressRequestBody } from '../address';

import { ExtraFieldValue } from './extra-field';
import { B2B_EXTRA_FIELD_PREFIX } from './map-extra-field-to-form-field';

export function stripExtraFieldsFromAddress<T extends AddressRequestBody>(
    formValues: T & Record<string, unknown>,
): T {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(formValues)) {
        if (!key.startsWith(B2B_EXTRA_FIELD_PREFIX)) {
            result[key] = value;
        }
    }

    return result as T;
}

export function extractExtraFieldValues(formValues: Record<string, unknown>): ExtraFieldValue[] {
    const extraValues: ExtraFieldValue[] = [];

    for (const [key, value] of Object.entries(formValues)) {
        if (key.startsWith(B2B_EXTRA_FIELD_PREFIX)) {
            const fieldId = parseInt(key.replace(B2B_EXTRA_FIELD_PREFIX, ''), 10);

            extraValues.push({ fieldId, fieldValue: value as string | number });
        }
    }

    return extraValues;
}
