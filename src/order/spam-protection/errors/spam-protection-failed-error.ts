import { StandardError } from '../../../common/error/errors';

export default class SpamProtectionFailedError extends StandardError {
    constructor() {
        super('We were not able to complete our spam protection verification. Please try again.');

        this.type = 'spam_protection_failed';
    }
}
