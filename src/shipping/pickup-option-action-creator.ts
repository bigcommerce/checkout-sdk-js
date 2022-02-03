import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { PickupOptionRequestBody, PickupOptionResult } from './pickup-option';
import { PickupOptionActionType } from './pickup-option-actions';
import PickupOptionRequestSender from './pickup-option-request-sender';

export default class PickupOptionActionCreator {
    constructor(
        private _pickupOptionRequestSender: PickupOptionRequestSender
    ) {}

    loadPickupOptions(query: PickupOptionRequestBody): Observable<Action<PickupOptionResult[]>> {
        return new Observable((observer: Observer<Action<PickupOptionResult[]>>) => {
            observer.next(createAction(PickupOptionActionType.LoadPickupOptionsRequested));

            this._pickupOptionRequestSender.fetchPickupOptions(query)
                .then(response => {
                    observer.next(createAction(PickupOptionActionType.LoadPickupOptionsSucceeded, response.body.results));
                    observer.complete();
                }).
                catch(response => {
                    observer.error(createErrorAction(PickupOptionActionType.LoadPickupOptionsFailed, response));
                });
        });
    }
}
