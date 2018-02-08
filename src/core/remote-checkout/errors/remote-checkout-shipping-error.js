import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutShippingError extends StandardError {
    /**
     * @constructor
     * @param {any} error
     */
    constructor(error) {
        super('There was an error retrieving your remote shipping address. Please try again.');

        this.type = 'remote_checkout_shipping';
        this.error = error;
    }
}
