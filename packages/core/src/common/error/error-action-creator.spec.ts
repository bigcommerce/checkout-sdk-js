import { createAction } from '@bigcommerce/data-store';

import ErrorActionCreator from './error-action-creator';
import { ErrorActionType } from './error-actions';

describe('ErrorActionCreator', () => {
    let actions: ErrorActionCreator;

    beforeEach(() => {
        actions = new ErrorActionCreator();
    });

    it('creates "clear error" action', () => {
        const error = new Error('Unexpected error');

        expect(actions.clearError(error))
            .toEqual(createAction(ErrorActionType.ClearError, error));
    });
});
