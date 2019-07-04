import { StandardError } from '../../../common/error/errors';

export default class SpamProtectionNotCompletedError extends StandardError {
    constructor() {
        super('You haven\'t complete our spam protection verification. Please try again.');

        this.type = 'spam_protection_not_completed';
    }
}
