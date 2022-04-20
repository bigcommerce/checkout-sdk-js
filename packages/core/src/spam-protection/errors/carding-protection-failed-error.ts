import { StandardError } from '../../common/error/errors';

/**
 * Throw this error if we fail to complete the required spam protection
 * verification due to an unknown reason.
 */
export default class CardingProtectionFailedError extends StandardError {
    constructor() {
        super('We were not able to verify that you are not a robot. Please try again.');

        this.name = 'CardingProtectionFailedError';
        this.type = 'carding_protection_failed';
    }
}
