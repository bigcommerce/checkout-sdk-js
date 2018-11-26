import { Response } from '@bigcommerce/request-sender';

import { InternalErrorResponseBody } from '../../common/error';
import { RequestError } from '../../common/error/errors';

export default class InvalidLoginTokenError extends RequestError {
    constructor(response: Response<InternalErrorResponseBody>) {
        super(response, { message: response.body.title });

        this.type = 'invalid_login_token';
    }
}
