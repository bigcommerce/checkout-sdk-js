import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';

import { CheckoutClient } from '../checkout';
import { RequestOptions } from '../common/http-request';

import * as actionTypes from './config-action-types';

/**
 * @todo Convert this file into TypeScript properly
 */
export default class ConfigActionCreator {
    constructor(
        private _checkoutClient: CheckoutClient
    ) {}

    loadConfig(options?: RequestOptions): Observable<Action> {
        return Observable.create((observer: Observer<Action>) => {
            observer.next(createAction(actionTypes.LOAD_CONFIG_REQUESTED));

            this._checkoutClient.loadConfig(options)
                .then(({ body = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_CONFIG_SUCCEEDED, body.data));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.LOAD_CONFIG_FAILED, response));
                });
        });
    }
}
