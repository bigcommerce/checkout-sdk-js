export default function guard<T>(value: T, errorFactory?: () => Error): NonNullable<T> {
    if (value === undefined || value === null) {
        throw errorFactory ? errorFactory() : new Error('An unexpected error has occurred.');
    }

    return value as NonNullable<T>;
}
