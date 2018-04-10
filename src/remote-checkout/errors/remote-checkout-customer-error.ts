import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutCustomerError extends StandardError {
    constructor(
        public error?: Error
    ) {
        super('There was an error retrieving your remote customer method. Please try again.');

        this.type = 'remote_checkout_customer';
    }
}
