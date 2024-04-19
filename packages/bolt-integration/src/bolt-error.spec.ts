import BoltError from './bolt-error';

describe('Bolt errors', () => {
    it('Get Bolt error - invalid card number', () => {
        const error = new BoltError('1000');

        expect(error.body).toEqual({ errors: [{ code: 'invalid_number' }] });
    });

    it('Get Bolt error - invalid expiry date', () => {
        const error = new BoltError('1001');

        expect(error.body).toEqual({ errors: [{ code: 'invalid_expiry_date' }] });
    });

    it('Get Bolt error - invalid cvc', () => {
        const error = new BoltError('1002');

        expect(error.body).toEqual({ errors: [{ code: 'invalid_cvc' }] });
    });

    it('Get Bolt error - invalid zip', () => {
        const error = new BoltError('1003');

        expect(error.body).toEqual({ errors: [{ code: 'invalid_zip' }] });
    });

    it('Get Bolt error - incorrect zip', () => {
        const error = new BoltError('2003');

        expect(error.body).toEqual({ errors: [{ code: 'incorrect_zip' }] });
    });

    it('default error is exist', () => {
        const error = new BoltError('incorrect error code');

        expect(error.body).toEqual({ errors: [{ code: 'general_error' }] });
    });
});
