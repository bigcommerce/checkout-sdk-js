import { createAction, createErrorAction, ThunkAction } from '@bigcommerce/data-store';
import { Observable, Observer } from 'rxjs';

import { InternalCheckoutSelectors } from '../checkout';
import { RequestOptions } from '../common/http-request';
import { IframeEventPoster } from '../common/iframe';

import { ExtensionNotFoundError } from './errors';
import { ExtensionRegion } from './extension';
import { ExtensionAction, ExtensionActionType } from './extension-actions';
import { ExtensionCommandHandlers } from './extension-command-handler';
import { ExtensionIframe } from './extension-iframe';
import { ExtensionMessenger } from './extension-messenger';
import { ExtensionPostEvent } from './extension-post-event';
import { ExtensionRequestSender } from './extension-request-sender';

export class ExtensionActionCreator {
    private _extensionMessenger: ExtensionMessenger | undefined;

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
                const extension = state.extensions.getExtensionByRegion(region);

                try {
                    if (!extension) {
                        throw new ExtensionNotFoundError(
                            `Unable to proceed due to no extension configured for the region: ${region}.`,
                        );
                    }

                    observer.next(createAction(ExtensionActionType.RenderExtensionRequested));

                    const iframe = new ExtensionIframe(container, extension, cartId);

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

    handleExtensionCommand(
        handlers: ExtensionCommandHandlers,
    ): ThunkAction<ExtensionAction, InternalCheckoutSelectors> {
        return (store) =>
            Observable.create((observer: Observer<ExtensionAction>) => {
                const extensions = store.getState().extensions.getExtensions();

                if (extensions && extensions.length > 0) {
                    this._extensionMessenger = new ExtensionMessenger(
                        new IframeEventPoster<ExtensionPostEvent>('*'),
                        extensions,
                    );
                    this._extensionMessenger.listen(handlers);
                }

                observer.next(createAction(ExtensionActionType.ListenCommandSucceeded));
                observer.complete();
            });
    }

    postExtensionMessage(
        event: ExtensionPostEvent,
        extensionId?: string,
    ): ThunkAction<ExtensionAction, InternalCheckoutSelectors> {
        return () =>
            Observable.create((observer: Observer<ExtensionAction>) => {
                if (!this._extensionMessenger) {
                    this._extensionMessenger = new ExtensionMessenger(
                        new IframeEventPoster<ExtensionPostEvent>('*'),
                        [],
                    );
                }

                try {
                    this._extensionMessenger.post(event, extensionId);

                    observer.next(createAction(ExtensionActionType.PostMessageSucceeded));
                    observer.complete();
                } catch (error) {
                    observer.error(createErrorAction(ExtensionActionType.PostMessageFailed, error));
                }
            });
    }
}
