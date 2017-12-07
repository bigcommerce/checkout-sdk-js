/**
 * @param {ErrorResponseBody} [error]
 * @return {ErrorResponseBody}
 */
export function getErrorResponseBody(error) {
    return {
        detail: 'Something went wrong',
        errors: ['Bad Request'],
        status: 400,
        title: 'Error',
        ...error,
    };
}
