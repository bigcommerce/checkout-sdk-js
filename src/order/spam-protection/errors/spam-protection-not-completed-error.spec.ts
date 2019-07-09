import SpamProtectionNotCompletedError from './spam-protection-not-completed-error';

describe('SpamProtectionNotCompletedError', () => {
    it('returns error name', () => {
        const error = new SpamProtectionNotCompletedError();

        expect(error.name).toEqual('SpamProtectionNotCompletedError');
    });
});
