import { Response } from '@bigcommerce/request-sender';

import { InternalErrorResponseBody } from '../../common/error';
import { RequestError } from '../../common/error/errors';

export default class CheckoutNotAvailableError extends RequestError {
    constructor(response: Response<InternalErrorResponseBody>) {
        super(response, { message: response.body.title });

        this.name = 'CheckoutNotAvailableError';
        this.type = 'checkout_not_available';
    }
}
