import BoltError from './bolt-error';

describe.only('Bolt errors', () => {
    it('Get Bolt error', () => {
        const error = new BoltError('1000');

        expect(error.body).toEqual({ errors: [{ code: 'invalid_number' }] });
    });

    it('default error is exist', () => {
        const error = new BoltError('incorrect error code');

        expect(error.body).toEqual({ errors: [{ code: 'general_error' }] });
    });
});
