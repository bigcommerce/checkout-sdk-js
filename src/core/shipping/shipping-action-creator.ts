import { Observable } from 'rxjs/Observable';
import { Action, createAction, createErrorAction } from '@bigcommerce/data-store';
import * as actionTypes from './shipping-action-types';

export default class ShippingActionCreator {
    initializeShipping(methodId: string, initializer: () => Promise<any>): Observable<Action> {
        return new Observable((observer) => {
            observer.next(createAction(actionTypes.INITIALIZE_SHIPPING_REQUESTED, undefined, { methodId }));

            initializer()
                .then((data) => {
                    observer.next(createAction(actionTypes.INITIALIZE_SHIPPING_SUCCEEDED, data, { methodId }));
                    observer.complete();
                })
                .catch((response) => {
                    observer.error(createErrorAction(actionTypes.INITIALIZE_SHIPPING_FAILED, response, { methodId }));
                });
        });
    }
}
