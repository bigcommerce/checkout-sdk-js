import { Response } from '@bigcommerce/request-sender';

import { InternalErrorResponseBody } from '../../common/error';
import { RequestError } from '../../common/error/errors';

/**
 * Throw this error when we are unable to retrieve a checkout object from the
 * server using the provided ID. It could be because the shopper does not have
 * permission to view the object, or the ID itself is invalid.
 */
export default class CheckoutNotAvailableError extends RequestError {
    constructor(response: Response<InternalErrorResponseBody>) {
        super(response, { message: response.body.title });

        this.name = 'CheckoutNotAvailableError';
        this.type = 'checkout_not_available';
    }
}
