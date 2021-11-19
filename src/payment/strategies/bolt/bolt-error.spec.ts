import BoltError from './bolt-error';

describe('Bolt errors', () => {
    it('Get Bolt error', () => {
        const error = new BoltError('1000');

        expect(error.message).toBe('Your card details could not be verified. Please double check them and try again.');
    });

    it('default error is exist', () => {
        const error = new BoltError('incorrect error code');

        expect(error.message).toBeTruthy();
    });
});
