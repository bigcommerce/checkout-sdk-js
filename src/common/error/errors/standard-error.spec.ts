import StandardError from './standard-error';

describe('StandardError', () => {
    class TestError extends StandardError {}

    it('returns error name', () => {
        const error = new TestError();

        expect(error.name).toEqual('StandardError');
    });

    it('sets error message if provided', () => {
        const message = 'Hello world';
        const error = new TestError(message);

        expect(error.message).toEqual(message);
    });
});
