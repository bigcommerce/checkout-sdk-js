import { createAction } from '@bigcommerce/data-store';
import { concat, defer, of, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { throwErrorAction } from '../common/error';
import { RequestOptions } from '../common/http-request';
import { Subscriptions, SubscriptionsActionType, SubscriptionsRequestSender, UpdateSubscriptionsAction } from '../subscription';

import { UpdateSubscriptionsError } from './errors';

export default class SubscriptionsActionCreator {
    constructor(
        private _subscriptionsRequestSender: SubscriptionsRequestSender
    ) {}

    updateSubscriptions(
        subscriptions: Subscriptions,
        options?: RequestOptions
    ): Observable<UpdateSubscriptionsAction> {
        return concat(
            of(createAction(SubscriptionsActionType.UpdateSubscriptionsRequested)),
            defer(async () => {
                const { body } = await this._subscriptionsRequestSender.updateSubscriptions(subscriptions, options);

                return createAction(SubscriptionsActionType.UpdateSubscriptionsSucceeded, body);
            })
        ).pipe(
            catchError(error => throwErrorAction(
                SubscriptionsActionType.UpdateSubscriptionsFailed,
                new UpdateSubscriptionsError(error)
            ))
        );
    }
}
