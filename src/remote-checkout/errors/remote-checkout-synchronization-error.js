import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutSynchronizationError extends StandardError {
    /**
     * @constructor
     * @param {Error} [error]
     */
    constructor(error) {
        super('Unable to synchronize your checkout details with a third party provider. Please try again later.');

        this.type = 'remote_checkout_synchronization';
        this.error = error;
    }
}
