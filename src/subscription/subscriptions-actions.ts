import { Action } from '@bigcommerce/data-store';

import { Subscriptions } from './subscriptions';

export enum SubscriptionsActionType {
    UpdateSubscriptionsRequested = 'UPDATE_SUBSCRIPTIONS_REQUESTED',
    UpdateSubscriptionsSucceeded = 'UPDATE_SUBSCRIPTIONS_SUCCEEDED',
    UpdateSubscriptionsFailed = 'UPDATE_SUBSCRIPTIONS_FAILED',
}
export type UpdateSubscriptionsAction =
    UpdateSubscriptionsRequestedAction |
    UpdateSubscriptionsSucceededAction |
    UpdateSubscriptionsFailedAction;

export interface UpdateSubscriptionsRequestedAction extends Action {
    type: SubscriptionsActionType.UpdateSubscriptionsRequested;
}

export interface UpdateSubscriptionsSucceededAction extends Action<Subscriptions> {
    type: SubscriptionsActionType.UpdateSubscriptionsSucceeded;
}

export interface UpdateSubscriptionsFailedAction extends Action<Error> {
    type: SubscriptionsActionType.UpdateSubscriptionsFailed;
}
