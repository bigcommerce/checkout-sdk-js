import StandardError from './standard-error';

describe('StandardError', () => {
    it('omits error constructor in stack trace', () => {
        try {
            throw new StandardError();
        } catch (error) {
            expect(error.stack).not.toContain('StandardError');
        }
    });

    it('sets error message if provided', () => {
        const message = 'Hello world';
        const error = new StandardError(message);

        expect(error.message).toEqual(message);
    });
});
