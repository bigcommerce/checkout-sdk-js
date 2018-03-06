import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutCustomerError extends StandardError {
    /**
     * @constructor
     * @param {any} error
     */
    constructor(error) {
        super('There was an error retrieving your remote customer method. Please try again.');

        this.type = 'remote_checkout_customer';
        this.error = error;
    }
}
