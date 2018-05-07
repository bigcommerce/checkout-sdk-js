import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import { ConfigActionType, LoadConfigAction } from './config-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class ConfigActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadConfig(options?: RequestOptions): Observable<LoadConfigAction> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(ConfigActionType.LoadConfigRequested));

            this._checkoutClient.loadConfig(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(ConfigActionType.LoadConfigSucceeded, body));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(ConfigActionType.LoadConfigFailed, response));
                });
        });
    }
}
