import { StandardError } from '../../common/error/errors';

/**
 * Throw this error if the shopper chooses not to complete the spam protection
 * challenge (i.e.: they close the reCaptcha window).
 */
export default class CardingProtectionChallengeNotCompletedError extends StandardError {
    constructor() {
        super('Please complete our human verification challenge and try again.');

        this.name = 'CardingProtectionChallengeNotCompletedError';
        this.type = 'carding_protection_challenge_not_completed';
    }
}
