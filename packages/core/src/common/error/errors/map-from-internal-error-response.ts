import { Response } from '@bigcommerce/request-sender';

import { InternalErrorResponseBody } from '../error-response-body';

import RequestError from './request-error';

export default function mapFromInternalErrorResponse(
    response: Response<InternalErrorResponseBody>,
    message?: string
): RequestError {
    const { body } = response;
    const { errors = [] } = body;

    return new RequestError(response, {
        message: joinErrors(errors) || body.detail || body.title || message,
        errors: errors.length ?
            errors.map(message => ({ code: body.type, message })) :
            [{ code: body.type, message: body.detail || body.title }],
    });
}

function joinErrors(errors: string[]): string | undefined {
    return errors.reduce((result: string[], error) => {
        if (error) {
            return [...result, error];
        }

        return result;
    }, []).join(' ');
}
