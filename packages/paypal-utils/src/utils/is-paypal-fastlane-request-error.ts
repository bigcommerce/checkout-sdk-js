export interface PaypalFastlaneRequestError {
    name: string;
    message: string;
    response: {
        body: {
            name: string;
        };
    };
}

export default function isPaypalFastlaneRequestError(
    error: unknown,
): error is PaypalFastlaneRequestError {
    return (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        'response' in error &&
        'body' in (error as PaypalFastlaneRequestError).response &&
        'name' in (error as PaypalFastlaneRequestError).response.body
    );
}
