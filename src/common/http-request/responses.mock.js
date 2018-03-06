export function getResponse(body, headers = {}, status = 200, statusText = 'OK') {
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

export function getErrorResponse(body = getErrorResponseBody(), headers = {}, status = 400, statusText = 'Bad Request') {
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

export function getErrorResponseBody(error) {
    return {
        detail: 'Something went wrong',
        errors: ['Bad Request'],
        status: 400,
        title: 'Error',
        ...error,
    };
}

export function getTimeoutResponse() {
    return {
        body: '',
        headers: {},
        status: 0,
        statusText: undefined,
    };
}
