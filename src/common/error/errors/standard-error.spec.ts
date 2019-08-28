import StandardError from './standard-error';

describe('StandardError', () => {
    it('returns error name', () => {
        const error = new StandardError();

        expect(error.name).toEqual('StandardError');
    });

    it('sets error message if provided', () => {
        const message = 'Hello world';
        const error = new StandardError(message);

        expect(error.message).toEqual(message);
    });
});
