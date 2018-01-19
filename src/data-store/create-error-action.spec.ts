import createErrorAction from './create-error-action';

describe('createErrorAction()', () => {
    it('creates a standard action object', () => {
        const payload = { message: 'Foobar' };
        const meta = { status: 'not found' };
        const action = createErrorAction('ACTION', payload, meta);

        expect(action).toEqual({ type: 'ACTION', error: true, payload, meta });
    });

    it('creates an empty action object', () => {
        const action = createErrorAction('ACTION');

        expect(action).toEqual({ type: 'ACTION', error: true });
    });

    it('throws an error if `type` is not provided', () => {
        expect(() => createErrorAction()).toThrow();
    });
});
