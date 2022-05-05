import CardingProtectionFailedError from './carding-protection-failed-error';

describe('CardingProtectionFailedError', () => {
    it('returns error name', () => {
        const error = new CardingProtectionFailedError();

        expect(error.name).toEqual('CardingProtectionFailedError');
    });
});
