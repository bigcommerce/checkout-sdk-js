
import { createErrorAction, Action } from '@bigcommerce/data-store';
import { throwError, Observable, Subscribable } from 'rxjs';

import { createRequestErrorFactory } from '../common/error';
import { getErrorResponse } from '../common/http-request/responses.mock';

import createActionTransformer from './create-action-transformer';

describe('createActionTransformer()', () => {
    let transformer: (action: Subscribable<Action>) => Observable<Action>;

    beforeEach(() => {
        transformer = createActionTransformer(createRequestErrorFactory());
    });

    describe('when the payload is a response', () => {
        it('transforms the error', () => {
            const payload = getErrorResponse();
            const action$ = throwError(createErrorAction('FOOBAR', payload));

            transformer(action$).subscribe({
                error: action => {
                    expect(action.payload).toBeInstanceOf(Error);
                },
            });
        });

        it('sets the error message as the body.detail', () => {
            const payload = getErrorResponse();
            const action$ = throwError(createErrorAction('FOOBAR', payload));

            transformer(action$).subscribe({
                error: action => {
                    expect(action.payload.message).toEqual(payload.body.detail);
                },
            });
        });

        it('uses the default message if none provided', () => {
            const payload = getErrorResponse();
            delete payload.body.detail;

            const action$ = throwError(createErrorAction('FOOBAR', payload));

            transformer(action$).subscribe({
                error: action => {
                    expect(action.payload.message).toEqual(expect.any(String));
                },
            });
        });
    });

    describe('when the payload is NOT a response', () => {
        it('does not transform if payload is `Error` instance', () => {
            const payload = new Error();
            const action$ = throwError(createErrorAction('FOOBAR', payload));

            transformer(action$).subscribe({
                error: action => {
                    expect(action.payload).toEqual(payload);
                },
            });
        });

        it('does not transform if payload is not `Response`', () => {
            const payload = {};
            const action$ = throwError(createErrorAction('FOOBAR', payload));

            transformer(action$).subscribe({
                error: action => {
                    expect(action.payload).toEqual(payload);
                },
            });
        });
    });
});
