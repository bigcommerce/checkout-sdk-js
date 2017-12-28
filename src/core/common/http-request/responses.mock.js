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

export function getErrorResponse(body, headers = {}, status = 400, statusText = 'Bad Request') {
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
