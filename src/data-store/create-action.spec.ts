import createAction from './create-action';

describe('createAction()', () => {
    it('creates a standard action object', () => {
        const payload = { message: 'Foobar' };
        const meta = { status: 'ok' };
        const action = createAction('ACTION', payload, meta);

        expect(action).toEqual({ type: 'ACTION', payload, meta });
    });

    it('creates an empty action object', () => {
        const action = createAction('ACTION');

        expect(action).toEqual({ type: 'ACTION' });
    });

    it('throws an error if `type` is not provided', () => {
        expect(() => createAction()).toThrow();
    });
});
