import { createAction, ThunkAction } from '@bigcommerce/data-store';
import { concat, defer, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { InternalCheckoutSelectors } from '../../checkout';
import { throwErrorAction } from '../../common/error';
import { RequestOptions } from '../../common/http-request';
import CustomerRequestSender from '../customer-request-sender';

import { GetCustomerAction, HeadlessCustomerActionType } from './headless-customer-actions';

export default class HeadlessCustomerActionCreator {
    constructor(private _customerRequestSender: CustomerRequestSender) {}

    getHeadlessCustomer(
        options?: RequestOptions,
    ): ThunkAction<GetCustomerAction, InternalCheckoutSelectors> {
        return (store) => {
            return concat(
                of(createAction(HeadlessCustomerActionType.GetCustomerRequested)),
                defer(() => {
                    const state = store.getState();
                    const host = state.config.getHost();

                    return this._customerRequestSender
                        .getHeadlessCustomer(host, options)
                        .then(({ body }) => {
                            return createAction(
                                HeadlessCustomerActionType.GetCustomerRequested,
                                body,
                            );
                        });
                }),
            ).pipe(
                catchError((error) =>
                    throwErrorAction(HeadlessCustomerActionType.GetCustomerFailed, error),
                ),
            );
        };
    }
}
