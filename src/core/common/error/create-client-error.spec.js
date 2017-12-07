import createClientError from './create-client-error';

describe('createClientError()', () => {
    it('returns error response object', () => {
        expect(createClientError('unknown_error', 'An unknown error has occured'))
            .toEqual({
                body: {
                    title: 'An unknown error has occured',
                    type: 'unknown_error',
                },
            });
    });
});
