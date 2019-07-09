import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutSynchronizationError extends StandardError {
    constructor(
        public error?: Error
    ) {
        super('Unable to synchronize your checkout details with a third party provider. Please try again later.');

        this.name = 'RemoteCheckoutSynchronizationError';
        this.type = 'remote_checkout_synchronization';
    }
}
