import { Response } from '@bigcommerce/request-sender';

import {
    ErrorResponseBody,
    PaymentResponse,
} from '@bigcommerce/checkout-sdk/payment-integration-api';

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

export function getPaymentResponse<T>(
    data: T,
    headers = {},
    status = 200,
    statusText = 'OK',
): PaymentResponse<T> {
    return {
        data,
        status,
        statusText,
        headers: {
            'content-type': 'application/json',
            ...headers,
        },
    };
}

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

export function getErrorResponseBody(): ErrorResponseBody {
    return {
        detail: 'Something went wrong',
        errors: ['Bad Request'],
        status: 400,
        title: 'Error',
        type: 'error',
    };
}

export function getTimeoutResponse(): Response<string> {
    return {
        body: '',
        headers: {},
        status: 0,
        statusText: '',
    };
}
