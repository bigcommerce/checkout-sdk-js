import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { RequestOptions } from '../common/http-request';
import { parseUrl } from '../common/url';

import { ExtensionNotFoundError } from './errors';
import { ExtensionRegion } from './extension';
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
        region: ExtensionRegion,
    ): ThunkAction<ExtensionAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create(async (observer: Observer<ExtensionAction>) => {
                const state = store.getState();
                const { id: cartId } = state.cart.getCartOrThrow();
                const {
                    links: { checkoutLink },
                } = state.config.getStoreConfigOrThrow();
                const extension = state.extensions.getExtensionByRegion(region);

                try {
                    if (!extension) {
                        throw new ExtensionNotFoundError(
                            `Unable to proceed due to no extension configured for the region: ${region}.`,
                        );
                    }

                    observer.next(createAction(ExtensionActionType.RenderExtensionRequested));

                    const iframe = new ExtensionIframe(container, extension, {
                        cartId,
                        parentOrigin: parseUrl(checkoutLink).origin,
                    });

                    await iframe.attach();

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
