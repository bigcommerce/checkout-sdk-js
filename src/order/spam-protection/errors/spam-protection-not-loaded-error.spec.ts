import SpamProtectionNotLoadedError from './spam-protection-not-loaded-error';

describe('SpamProtectionNotLoadedError', () => {
    it('returns error name', () => {
        const error = new SpamProtectionNotLoadedError();

        expect(error.name).toEqual('SpamProtectionNotLoadedError');
    });
});
