import { StandardError } from '../../common/error/errors';

/**
 * This error should be thrown when a shopper tries to sign in as a guest but
 * they are already signed in as a registered customer.
 */
export default class UnableToContinueAsGuestError extends StandardError {
    constructor(message?: string) {
        super(message || 'Unable to continue as a guest because the customer is already signed in.');

        this.name = 'UnableToContinueAsGuestError';
        this.type = 'unable_to_continue_as_guest';
    }
}
