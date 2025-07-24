export interface BigcommerceFastlaneRequestError {
    name: string;
    message: string;
    response: {
        name: string;
    };
}

export default function isBigcommerceFastlaneRequestError(
    error: unknown,
): error is BigcommerceFastlaneRequestError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'response' in error &&
        'name' in (error as BigcommerceFastlaneRequestError).response
    );
}
