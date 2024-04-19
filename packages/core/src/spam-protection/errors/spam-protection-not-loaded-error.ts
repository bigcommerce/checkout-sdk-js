import { StandardError } from '../../common/error/errors';

/**
 * Throw this error if spam protection is not loaded when trying to
 * complete the required spam protection verification.
 */
export default class SpamProtectionNotLoadedError extends StandardError {
    constructor() {
        super('Spam protection is not loaded. Please try again.');

        this.name = 'SpamProtectionNotLoadedError';
        this.type = 'spam_protection_failed';
    }
}
