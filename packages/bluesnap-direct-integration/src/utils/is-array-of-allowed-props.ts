import { BluesnapDirectNocInputAllowedStyle } from '../types';

export default function isArrayOfAllowedProps(
    fields: string[],
): fields is Array<keyof BluesnapDirectNocInputAllowedStyle> {
    return fields.every((field) =>
        ['color', 'fontFamily', 'fontSize', 'fontWeight'].includes(field),
    );
}
