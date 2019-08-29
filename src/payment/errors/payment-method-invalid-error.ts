import { Response } from '@bigcommerce/request-sender';

import { RequestError } from '../../common/error/errors';

/**
 * Throw this error if we are unable to successfully submit a server request
 * using a payment method because the method has invalid configuration or is in
 * an invalid state.
 */
export default class PaymentMethodInvalidError extends RequestError {
    constructor(response?: Response) {
        super(response, { message: 'There is a problem processing your payment. Please try again later.' });

        this.name = 'PaymentMethodInvalidError';
        this.type = 'payment_method_invalid';
    }
}
