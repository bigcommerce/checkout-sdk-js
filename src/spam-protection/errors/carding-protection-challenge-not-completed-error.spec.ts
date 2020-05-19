import CardingProtectionChallengeNotCompletedError from './carding-protection-challenge-not-completed-error';

describe('CardingProtectionChallengeNotCompletedError', () => {
    it('returns error name', () => {
        const error = new CardingProtectionChallengeNotCompletedError();

        expect(error.name).toEqual('CardingProtectionChallengeNotCompletedError');
    });
});
