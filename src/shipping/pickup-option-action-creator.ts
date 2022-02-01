import { createAction, createErrorAction, Action } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { PickupOption, PickupOptionRequestPayload } from './pickup-option';
import { PickupOptionActionType } from './pickup-option-actions';
import PickupOptionRequestSender from './pickup-option-request-sender';

export default class PickupOptionActionCreator {
    constructor(
        private _pickupOptionRequestSender: PickupOptionRequestSender
    ) {}

    loadPickupOptions(query: PickupOptionRequestPayload): Observable<Action<PickupOption[]>> {
        return new Observable((observer: Observer<Action<PickupOption[]>>) => {
            observer.next(createAction(PickupOptionActionType.LoadPickupOptionsRequested));

            this._pickupOptionRequestSender.fetchPickupOptions(query)
                .then(response => {
                    observer.next(createAction(PickupOptionActionType.LoadPickupOptionSucceeded, response.body.results));
                    observer.complete();
                }).
                catch(response => {
                    observer.error(createErrorAction(PickupOptionActionType.LoadPickupOptionsFailed, response));
                });
        });
    }
}
