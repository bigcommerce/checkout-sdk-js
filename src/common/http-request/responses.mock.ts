import { Response } from '@bigcommerce/request-sender';

import { PaymentResponse } from '../../payment';
import { ErrorResponseBody } from '../error';

export function getResponse<T>(body: T, headers = {}, status = 200, statusText = 'OK'): Response<T> {
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

export function getPaymentResponse<T>(data: T, headers = {}, status = 200, statusText = 'OK'): PaymentResponse<T> {
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

export function getErrorResponse(body = getErrorResponseBody(), headers = {}, status = 400, statusText = 'Bad Request'): Response {
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

export function getTimeoutResponse(): Response<string> {
    return {
        body: '',
        headers: {},
        status: 0,
        statusText: '',
    };
}
