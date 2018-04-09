import { StandardError } from '../../common/error/errors';

export default class RemoteCheckoutSessionError extends StandardError {
    constructor(
        public error?: Error
    ) {
        super('Your remote session has expired. Please log in again.');

        this.type = 'remote_checkout_session';
    }
}
