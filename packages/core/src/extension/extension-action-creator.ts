import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { RequestOptions } from '../common/http-request';
import { parseUrl } from '../common/url';
import { WorkerEventListener } from '../common/worker';

import { createExtensionWebWorker } from './create-extension-web-worker';
import { ExtensionNotFoundError } from './errors';
import { ExtensionRegion } from './extension';
import { ExtensionAction, ExtensionActionType } from './extension-actions';
import { ExtensionIframe } from './extension-iframe';
import { ExtensionMessageMap, ExtensionMessageType } from './extension-message';
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

                    if (extension.type === 'worker') {
                        const worker = createExtensionWebWorker(extension.url);

                        // Below code should be part of the new ExtensionWorkers class
                        const listener = new WorkerEventListener<ExtensionMessageMap>(worker);
                        const sampleHandler = (
                            message: ExtensionMessageMap[ExtensionMessageType.GetConsignments],
                        ) => {
                            listener.removeListener(
                                ExtensionMessageType.GetConsignments,
                                sampleHandler,
                            );
                            // eslint-disable-next-line no-console
                            console.log('This handler is removed now.', message);
                        };
                        const messageLogger = (
                            message: ExtensionMessageMap[ExtensionMessageType.GetConsignments],
                        ) => {
                            // eslint-disable-next-line no-console
                            console.log('Host received message from worker:', message);
                        };

                        listener.listen();
                        listener.addListener(ExtensionMessageType.GetConsignments, messageLogger);
                        listener.addListener(ExtensionMessageType.GetConsignments, sampleHandler);

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
