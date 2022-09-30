import { RequestError } from "@bigcommerce/checkout-sdk/payment-integration-api";
import { Response } from '@bigcommerce/request-sender';

import { InternalErrorResponseBody } from '../../common/error';

/**
 * Throw this error we are not able to sign in a shopper because the provided
 * login token is invalid.
 */
export default class InvalidLoginTokenError extends RequestError {
    constructor(response: Response<InternalErrorResponseBody>) {
        super(response, { message: response.body.title });

        this.name = 'InvalidLoginTokenError';
        this.type = 'invalid_login_token';
    }
}
