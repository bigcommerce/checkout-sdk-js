import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { RequestOptions } from '../common/http-request';

import { ExtensionAction, ExtensionActionType } from './extension-actions';
import { ExtensionRequestSender } from './extension-request-sender';

export class ExtensionActionCreator {
    constructor(private _requestSender: ExtensionRequestSender) {}

    loadExtensions(
        options?: RequestOptions,
    ): ThunkAction<ExtensionAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<ExtensionAction>) => {
                const state = store.getState();
                const cart = state.cart.getCartOrThrow();

                observer.next(createAction(ExtensionActionType.LoadExtensionsRequested));

                this._requestSender
                    .loadExtensions({
                        ...options,
                        params: { ...options?.params, cartId: cart.id },
                    })
                    .then((response) => {
                        const extensions = response.body;

                        observer.next(
                            createAction(ExtensionActionType.LoadExtensionsSucceeded, extensions),
                        );
                        observer.complete();
                    })
                    .catch((response) => {
                        observer.error(
                            createErrorAction(ExtensionActionType.LoadExtensionsFailed, response),
                        );
                    });
            });
    }
}
