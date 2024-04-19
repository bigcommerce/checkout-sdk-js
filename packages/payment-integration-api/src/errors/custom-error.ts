export default interface CustomError extends Error {
    message: string;
    type: string;
    subtype?: string;
}

export function isCustomError(error: any): error is CustomError {
    return (
        typeof error.message === 'string' &&
        typeof error.type === 'string' &&
        (typeof error.subtype === 'string' || !error.subtype) &&
        error instanceof Error
    );
}
