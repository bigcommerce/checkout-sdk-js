import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { RequestOptions } from '../common/http-request';

import { ExtensionNotFoundError } from './errors';
import { ExtensionRegions } from './extension';
import { ExtensionAction, ExtensionActionType } from './extension-actions';
import { ExtensionIframe } from './extension-iframe';
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

    renderExtension(
        container: string,
        region: ExtensionRegions,
    ): ThunkAction<ExtensionAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<ExtensionAction>) => {
                const state = store.getState();
                const cart = state.cart.getCartOrThrow();
                const extensions = state.extensions.getExtensions();
                const extension = extensions?.filter((e) => e.region === region)[0];

                if (!extension) {
                    throw new ExtensionNotFoundError(
                        `Unable to proceed due to no extension configured for ${region}.`,
                    );
                }

                observer.next(createAction(ExtensionActionType.RenderExtensionRequested));

                try {
                    const iframe = new ExtensionIframe(container, extension, cart.id);

                    iframe.attach();

                    observer.next(createAction(ExtensionActionType.RenderExtensionSucceeded));
                    observer.complete();
                } catch (error) {
                    observer.error(
                        createErrorAction(ExtensionActionType.RenderExtensionFailed, error),
                    );
                }
            });
    }
}
