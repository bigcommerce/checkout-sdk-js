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
        return () =>
            Observable.create((observer: Observer<ExtensionAction>) => {
                observer.next(createAction(ExtensionActionType.LoadExtensionsRequested));

                this._requestSender
                    .loadExtensions(options)
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
