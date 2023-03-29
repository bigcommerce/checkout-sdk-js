import {
    BlueSnapDirectErrorDescription,
    BlueSnapDirectInputValidationErrorDescription,
} from './types';

export default function isBlueSnapDirectInputValidationErrorDescription(
    errorDescription?: BlueSnapDirectErrorDescription,
): errorDescription is BlueSnapDirectInputValidationErrorDescription {
    if (errorDescription === undefined) {
        return false;
    }

    return [BlueSnapDirectErrorDescription.EMPTY, BlueSnapDirectErrorDescription.INVALID].includes(
        errorDescription,
    );
}
