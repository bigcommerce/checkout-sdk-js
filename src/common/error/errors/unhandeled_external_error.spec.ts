import UnhandledExternalError from './unhandeled_external_error';

describe('UnhandledExternalError', () => {
    it('returns error name', () => {
        const error = new UnhandledExternalError();

        expect(error.name).toEqual('UnhandledExternalError');
    });
});
