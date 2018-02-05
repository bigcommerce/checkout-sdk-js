import { Observable } from 'rxjs/Observable';
import { createAction, createErrorAction } from '../../data-store';
import * as actionTypes from './config-action-types';

export default class ConfigActionCreator {
    /**
     * @constructor
     * @param {CheckoutClient} checkoutClient
     */
    constructor(checkoutClient) {
        this._checkoutClient = checkoutClient;
    }

    /**
     * @param {RequestOptions} [options]
     * @return {Observable<Action>}
     */
    loadConfig(options) {
        return Observable.create((observer) => {
            observer.next(createAction(actionTypes.LOAD_CONFIG_REQUESTED));

            this._checkoutClient.loadConfig(options)
                .then(({ body: { data } = {} }) => {
                    observer.next(createAction(actionTypes.LOAD_CONFIG_SUCCEEDED, data));
                    observer.complete();
                })
                .catch(response => {
                    observer.error(createErrorAction(actionTypes.LOAD_CONFIG_FAILED, response));
                });
        });
    }
}
