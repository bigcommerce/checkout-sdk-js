import HumanVerificationRequiredError from './human-verification-required-error';

describe('HumanVerificationRequiredError', () => {
    it('carries the site key and standard error metadata', () => {
        const error = new HumanVerificationRequiredError('6LeXXXXX');

        expect(error).toBeInstanceOf(Error);
        expect(error.siteKey).toBe('6LeXXXXX');
        expect(error.name).toBe('HumanVerificationRequiredError');
        expect(error.type).toBe('human_verification_required');
        expect(error.message).toBe('Human verification required');
    });
});
