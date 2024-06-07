export default interface CustomError extends Error {
    message: string;
    type: string;
    subtype?: string;
}

export function isCustomError(error: unknown): error is CustomError {
    return typeof error === 'object' && error !== null && 'message' in error && 'type' in error;
}
