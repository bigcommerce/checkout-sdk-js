import { RequestError } from '../../common/error/errors';

export default class PaymentMethodInvalidError extends RequestError {
    /**
     * @constructor
     * @param {Response} response
     */
    constructor(response) {
        super(response, 'There is a problem processing your payment. Please try again later.');

        this.type = 'payment_method_invalid';
    }
}
