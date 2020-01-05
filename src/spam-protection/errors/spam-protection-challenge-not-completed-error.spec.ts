import SpamProtectionChallengeNotCompletedError from './spam-protection-challenge-not-completed-error';

describe('SpamProtectionChallengeNotCompletedError', () => {
    it('returns error name', () => {
        const error = new SpamProtectionChallengeNotCompletedError();

        expect(error.name).toEqual('SpamProtectionChallengeNotCompletedError');
    });
});
