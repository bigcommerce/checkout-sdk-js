import { StandardError } from '../../common/error/errors';

/**
 * Throw this error if the shopper chooses not to complete the spam protection
 * challenge (i.e.: they close the reCaptcha window).
 */
export default class SpamProtectionChallengeNotCompletedError extends StandardError {
    constructor() {
        super('You haven\'t complete our spam protection challenge. Please try again.');

        this.name = 'SpamProtectionChallengeNotCompletedError';
        this.type = 'spam_protection_challenge_not_completed';
    }
}
