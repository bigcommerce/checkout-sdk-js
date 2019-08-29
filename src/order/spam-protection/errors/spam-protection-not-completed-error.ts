import { StandardError } from '../../../common/error/errors';

/**
 * Throw this error if the shopper chooses not to complete the spam protection
 * challenge (i.e.: they close the reCaptcha window).
 */
export default class SpamProtectionNotCompletedError extends StandardError {
    constructor() {
        super('You haven\'t complete our spam protection verification. Please try again.');

        this.name = 'SpamProtectionNotCompletedError';
        this.type = 'spam_protection_not_completed';
    }
}
