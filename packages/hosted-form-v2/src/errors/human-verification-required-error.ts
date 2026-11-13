import { StandardError } from '../common/errors';

export default class HumanVerificationRequiredError extends StandardError {
    constructor(readonly siteKey: string) {
        super('Human verification required');

        this.name = 'HumanVerificationRequiredError';
        this.type = 'human_verification_required';
    }
}
