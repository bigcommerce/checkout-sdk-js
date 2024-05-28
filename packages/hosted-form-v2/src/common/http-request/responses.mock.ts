import { Response } from '@bigcommerce/request-sender';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

export function getErrorResponse(
    body = getErrorResponseBody(),
    headers = {},
    status = 400,
    statusText = 'Bad Request',
): Response<any> {
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

export function getErrorResponseBody(error?: any): ErrorResponseBody {
    return {
        detail: 'Something went wrong',
        errors: ['Bad Request'],
        status: 400,
        title: 'Error',
        ...error,
    };
}
