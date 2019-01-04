import { createAction } from '@bigcommerce/data-store';

import clearErrorReducer from './clear-error-reducer';
import ErrorActionCreator from './error-action-creator';

describe('clearErrorReducer()', () => {
    let actions: ErrorActionCreator;

    beforeEach(() => {
        actions = new ErrorActionCreator();
    });

    it('returns new state without error', () => {
        const fooError = new Error('foo');
        const barError = new Error('bar');
        const action = actions.clearError(fooError);

        expect(clearErrorReducer({ fooError, barError }, action))
            .toEqual({ barError });
    });

    it('does nothing if action is not "clear error" action', () => {
        const fooError = new Error('foo');
        const barError = new Error('bar');
        const action = createAction('FOOBAR');

        expect(clearErrorReducer({ fooError, barError }, action))
            .toEqual({ fooError, barError });
    });

    it('finds error recursively', () => {
        const fooError = new Error('foo');
        const barError = new Error('bar');
        const action = actions.clearError(fooError);

        expect(clearErrorReducer({ 123: { fooError, barError } }, action))
            .toEqual({ 123: { barError } });
    });
});
