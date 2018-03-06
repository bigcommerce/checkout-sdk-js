import { Observable } from 'rxjs';
import { createErrorAction } from '@bigcommerce/data-store';
import { createRequestErrorFactory } from '../common/error';
import { getErrorResponse } from '../common/http-request/responses.mock';
import createActionTransformer from './create-action-transformer';

describe('createActionTransformer()', () => {
    let transformer;

    beforeEach(() => {
        transformer = createActionTransformer(createRequestErrorFactory());
    });

    it('transforms error response payload', () => {
        const payload = getErrorResponse();
        const action$ = Observable.throw(createErrorAction('FOOBAR', payload));

        transformer(action$).subscribe({
            error: (action) => {
                expect(action.payload).toBeInstanceOf(Error);
            },
        });
    });

    it('does not transform if payload is `Error` instance', () => {
        const payload = new Error();
        const action$ = Observable.throw(createErrorAction('FOOBAR', payload));

        transformer(action$).subscribe({
            error: (action) => {
                expect(action.payload).toEqual(payload);
            },
        });
    });

    it('does not transform if payload is not `Response`', () => {
        const payload = {};
        const action$ = Observable.throw(createErrorAction('FOOBAR', payload));

        transformer(action$).subscribe({
            error: (action) => {
                expect(action.payload).toEqual(payload);
            },
        });
    });
});
