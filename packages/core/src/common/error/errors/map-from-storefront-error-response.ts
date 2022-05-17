import { Response } from '@bigcommerce/request-sender';

import { StorefrontErrorResponseBody } from '../error-response-body';

import RequestError from './request-error';

export default function mapFromStorefrontErrorResponse(
    response: Response<StorefrontErrorResponseBody>,
    message?: string
): RequestError<StorefrontErrorResponseBody> {
    const { body } = response;

    return new RequestError(response, {
        message: message || body.detail || body.title,
        errors: [{
            code: body.code || body.type,
            message: body.detail || body.title,
        }],
    });
}
