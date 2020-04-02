import { createAction } from '@bigcommerce/data-store';

import { RequestError } from '../common/error/errors';
import { getErrorResponse } from '../common/http-request/responses.mock';
import { SubscriptionsActionType } from '../subscription';

import subscriptionsReducer from './subscriptions-reducer';
import SubscriptionsState from './subscriptions-state';

describe('subscriptionsReducer', () => {
    let initialState: SubscriptionsState;

    beforeEach(() => {
        initialState = { errors: {}, statuses: {} };
    });

    it('returns pending when subscriptions update requested', () => {
        const action = createAction(SubscriptionsActionType.UpdateSubscriptionsRequested);
        const output = subscriptionsReducer(initialState, action);

        expect(output).toEqual({
            errors: { updateError: undefined },
            statuses: { isUpdating: true },
        });
    });

    it('returns clean state when subscriptions updated', () => {
        const action = createAction(SubscriptionsActionType.UpdateSubscriptionsSucceeded, {});
        const output = subscriptionsReducer(initialState, action);

        expect(output).toEqual({
            errors: { updateError: undefined },
            statuses: { isUpdating: false },
        });
    });

    it('returns error when subscriptions failed to update', () => {
        const action = createAction(SubscriptionsActionType.UpdateSubscriptionsFailed, new RequestError(getErrorResponse()));
        const output = subscriptionsReducer(initialState, action);

        expect(output).toEqual({
            errors: { updateError: action.payload },
            statuses: { isUpdating: false },
        });
    });
});
