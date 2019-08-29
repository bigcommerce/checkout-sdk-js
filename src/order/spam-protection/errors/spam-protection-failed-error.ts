import { StandardError } from '../../../common/error/errors';

/**
 * Throw this error if we fail to complete the required spam protection
 * verification due to an unknown reason.
 */
export default class SpamProtectionFailedError extends StandardError {
    constructor() {
        super('We were not able to complete our spam protection verification. Please try again.');

        this.name = 'SpamProtectionFailedError';
        this.type = 'spam_protection_failed';
    }
}
