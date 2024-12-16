import { Response } from '@bigcommerce/request-sender';

import { ErrorResponseBody } from '@bigcommerce/checkout-sdk/payment-integration-api';

import { HeadlessPaymentMethodResponse, PaymentResponse } from '../../payment';
import HeadlessPaymentMethod from '../../payment/headless-payment-method';

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

export function getHeadlessPaymentResponse<T>(
    site: HeadlessPaymentMethod<T>,
    headers = {},
    status = 200,
    statusText = 'OK',
): Response<HeadlessPaymentMethodResponse<T>> {
    return {
        body: {
            data: {
                site,
            },
        },
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
