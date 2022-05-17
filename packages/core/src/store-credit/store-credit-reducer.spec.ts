import { createAction, createErrorAction } from '@bigcommerce/data-store';

import { StorefrontErrorResponseBody } from '../common/error';
import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';

import { StoreCreditActionType } from './store-credit-actions';
import storeCreditReducer from './store-credit-reducer';
import StoreCreditState from './store-credit-state';

describe('storeCreditReducer()', () => {
    const initialState: StoreCreditState = { errors: {}, statuses: {} };

    it('returns an error state if store credit failed to be applied', () => {
        const errorResponseBody: StorefrontErrorResponseBody = {
            title: '',
            detail: '',
            type: '',
            status: 400,
        };

        const action = createErrorAction(
            StoreCreditActionType.ApplyStoreCreditFailed,
            new RequestError(getErrorResponse(errorResponseBody))
        );

        expect(storeCreditReducer(initialState, action)).toEqual(expect.objectContaining({
            errors: { applyError: action.payload },
            statuses: { isApplying: false },
        }));
    });

    it('returns new state while applying store credit', () => {
        const action = createAction(StoreCreditActionType.ApplyStoreCreditRequested);

        expect(storeCreditReducer(initialState, action)).toEqual(expect.objectContaining({
            statuses: { isApplying: true },
        }));
    });
});
