import { Response } from '@bigcommerce/request-sender';

import { RequestError } from '../../common/error/errors';

export default class PaymentMethodNotAllowedError extends RequestError {
    constructor(response?: Response) {
        super(response, { message: 'The selected payment method is not allowed for this transaction. Please choose another payment method.' });

        this.name = 'PaymentMethodNotAllowedError';
        this.type = 'payment_method_not_allowed';
    }
}
