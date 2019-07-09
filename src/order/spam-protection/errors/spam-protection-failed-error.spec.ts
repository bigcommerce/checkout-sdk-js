import SpamProtectionFailedError from './spam-protection-failed-error';

describe('SpamProtectionFailedError', () => {
    it('returns error name', () => {
        const error = new SpamProtectionFailedError();

        expect(error.name).toEqual('SpamProtectionFailedError');
    });
});
