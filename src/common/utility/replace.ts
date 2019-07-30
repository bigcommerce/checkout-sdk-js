import isEqual from './is-equal';

/**
 * Replace the current value with a new value if the former is different to the
 * latter.
 */
export default function replace<T>(currentValue: T, newValue?: T): T {
    if (newValue === undefined || isEqual(currentValue, newValue)) {
        return currentValue;
    }

    return newValue;
}
