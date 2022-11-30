import { createAction, createErrorAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { ActionOptions, cachableAction } from '../common/data-store';
import { RequestOptions } from '../common/http-request';

import { ConfigActionType, LoadConfigAction } from './config-actions';

import { ConfigRequestSender } from '.';

export default class ConfigActionCreator {
    constructor(private _configRequestSender: ConfigRequestSender) {}

    @cachableAction
    loadConfig(options?: RequestOptions & ActionOptions): Observable<LoadConfigAction> {
        return Observable.create((observer: Observer<LoadConfigAction>) => {
            observer.next(createAction(ConfigActionType.LoadConfigRequested));

            this._configRequestSender
                .loadConfig(options)
                .then((response) => {
                    observer.next(
                        createAction(ConfigActionType.LoadConfigSucceeded, response.body),
                    );
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(ConfigActionType.LoadConfigFailed, response));
                });
        });
    }
}
