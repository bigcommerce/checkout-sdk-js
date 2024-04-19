import { BlueSnapDirectRedirectResponseProviderData } from '../types';

export default function isBlueSnapDirectRedirectResponseProviderData(
    value: unknown,
): value is BlueSnapDirectRedirectResponseProviderData {
    if (typeof value !== 'object' || value === null) {
        return false;
    }

    const partialValue: Partial<BlueSnapDirectRedirectResponseProviderData> = value;

    if (!partialValue.merchantid) {
        return false;
    }

    return typeof partialValue.merchantid === 'string';
}
