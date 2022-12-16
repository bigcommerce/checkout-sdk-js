import { Response } from '@bigcommerce/request-sender';

export function getResponse<T>(
    body: T,
    headers = {},
    status = 200,
    statusText = 'OK',
): Response<T> {
    return {
        body,
        status,
        statusText,
        headers: {
            'content-type': 'application/json',
            ...headers,
        },
    };
}
