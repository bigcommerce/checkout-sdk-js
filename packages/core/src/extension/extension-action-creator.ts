import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { RequestOptions } from '../common/http-request';
import { parseUrl } from '../common/url';

import { createExtensionWebWorker } from './create-extension-web-worker';
import { ExtensionNotFoundError } from './errors';
import { ExtensionRegion, ExtensionType } from './extension';
import { ExtensionAction, ExtensionActionType } from './extension-actions';
import { ExtensionIframe } from './extension-iframe';
import { ExtensionRequestSender } from './extension-request-sender';
import { WorkerExtensionMessenger } from './worker-extension-messenger';

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
        workerExtensionMessenger: WorkerExtensionMessenger,
    ): ThunkAction<ExtensionAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create(async (observer: Observer<ExtensionAction>) => {
                const state = store.getState();
                const { id: cartId } = state.cart.getCartOrThrow();
                const {
                    links: { checkoutLink },
                    checkoutSettings: { features },
                } = state.config.getStoreConfigOrThrow();

                if (!features['PROJECT-5029.checkout_extension']) {
                    return observer.complete();
                }

                const extension = state.extensions.getExtensionByRegion(region);

                try {
                    if (!extension) {
                        throw new ExtensionNotFoundError(
                            `Unable to proceed due to no extension configured for the region: ${region}.`,
                        );
                    }

                    observer.next(createAction(ExtensionActionType.RenderExtensionRequested));

                    if (extension.type === ExtensionType.Worker) {
                        const worker = createExtensionWebWorker(extension.url);

                        workerExtensionMessenger.add(extension.id, worker);

                        // TODO: CHECKOUT-9248 Add the web worker reference to the checkout SDK internal state for consistent access and management.
                        // eslint-disable-next-line no-console
                        console.log('Worker created:', worker);
                    } else {
                        const iframe = new ExtensionIframe(container, extension, {
                            cartId,
                            parentOrigin: parseUrl(checkoutLink).origin,
                        });

                        await iframe.attach();
                    }

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
