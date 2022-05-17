import { Response } from '@bigcommerce/request-sender';

import { PaymentErrorResponseBody } from '../error-response-body';

import RequestError from './request-error';

export default function mapFromPaymentErrorResponse(
    response: Response<PaymentErrorResponseBody>,
    message?: string
): RequestError {
    const { body } = response;
    const { errors = [] } = body;

    return new RequestError(response, {
        message: joinErrors(errors) || message,
        errors,
    });
}

function joinErrors(errors: Array<{ code: string; message?: string }>): string | undefined {
    if (!Array.isArray(errors)) {
        return;
    }

    return errors.reduce((result: string[], error) => {
        if (error && error.message) {
            return [...result, error.message];
        }

        return result;
    }, []).join(' ');
}
