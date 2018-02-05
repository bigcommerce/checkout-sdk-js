import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutPaymentError extends StandardError {
    /**
     * @constructor
     * @param {any} error
     */
    constructor(error) {
        super('There was an error retrieving your remote payment method. Please try again.');

        this.type = 'remote_checkout_payment';
        this.error = error;
    }
}
