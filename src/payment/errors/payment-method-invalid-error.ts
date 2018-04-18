import { Response } from '@bigcommerce/request-sender';

import { RequestError } from '../../common/error/errors';

export default class PaymentMethodInvalidError extends RequestError {
    constructor(response?: Response) {
        super(response, 'There is a problem processing your payment. Please try again later.');

        this.type = 'payment_method_invalid';
    }
}
