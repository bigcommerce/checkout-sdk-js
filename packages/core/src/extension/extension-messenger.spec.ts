import EventEmitter from 'events';

import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import { ExtensionNotFoundError } from './errors';
import { UnsupportedExtensionCommandError } from './errors/unsupported-extension-command-error';
import { Extension } from './extension';
import {
    ExtensionCommandContext,
    ExtensionCommandMap,
    ExtensionCommandType,
} from './extension-commands';
import { ExtensionEvent } from './extension-events';
import { ExtensionMessenger } from './extension-messenger';
import { getExtensionEvent, getExtensions } from './extension.mock';

describe('ExtensionMessenger', () => {
    let extensionCommandHandler: jest.Mock;
    let extension: Extension;
    let extensionMessenger: ExtensionMessenger;
    let event: {
        origin: string;
        data: ExtensionEvent;
    };
    let store: ReadableCheckoutStore;

    beforeEach(() => {
        store = createCheckoutStore(getCheckoutStoreState());
        extension = getExtensions()[0];
        event = getExtensionEvent();
        extensionCommandHandler = jest.fn();
    });

    describe('#listen() and #stopListen()', () => {
        let listener: IframeEventListener<ExtensionCommandMap>;

        beforeEach(() => {
            listener = new IframeEventListener(extension.url);

            const listeners = {
                [extension.id]: listener,
            };

            extensionMessenger = new ExtensionMessenger(store, listeners, {});
        });

        it('should throw if unable to find the extensiion', () => {
            expect(() =>
                extensionMessenger.listen(
                    'xxx',
                    ExtensionCommandType.ReloadCheckout,
                    extensionCommandHandler,
                ),
            ).toThrow(ExtensionNotFoundError);
        });

        it('should throw if trying to listen for an unsupported command', () => {
            expect(() =>
                extensionMessenger.listen(
                    extension.id,
                    'INVALID_COMMAND' as ExtensionCommandType,
                    extensionCommandHandler,
                ),
            ).toThrow(UnsupportedExtensionCommandError);
        });

        it('should listen and add an event listener', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(
                    type,
                    ({ context }: { context: ExtensionCommandContext }) => {
                        listener({ type }, context);
                    },
                );
            });

            extensionMessenger.listen(
                extension.id,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId: extension.id },
            });

            expect(extensionCommandHandler).toHaveBeenCalledWith(
                { type: ExtensionCommandType.ReloadCheckout },
                { extensionId: extension.id },
            );
        });

        it('should listen to commands emitted by same extension', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(
                    type,
                    ({ context }: { context: ExtensionCommandContext }) => {
                        listener({ type }, context);
                    },
                );
            });

            extensionMessenger.listen(
                extension.id,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId: extension.id },
            });

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId: getExtensions()[1].id },
            });

            expect(extensionCommandHandler).toHaveBeenCalledTimes(1);
        });

        it('should remove the event listener', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(
                    type,
                    ({ context }: { context: ExtensionCommandContext }) => {
                        listener({ type }, context);
                    },
                );
            });

            jest.spyOn(listener, 'removeListener').mockImplementation((type) => {
                eventEmitter.removeAllListeners(type);
            });

            const remover = extensionMessenger.listen(
                extension.id,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            remover();

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId: extension.id },
            });

            expect(extensionCommandHandler).not.toHaveBeenCalled();
        });

        it('should stop listening', () => {
            jest.spyOn(listener, 'stopListen');

            extensionMessenger.listen(
                extension.id,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            extensionMessenger.stopListen(extension.id);

            // FIXME
            expect(listener.stopListen).toHaveBeenCalled();
        });
    });

    describe('#post()', () => {
        it('should throw ExtensionNotFoundError if the extension is not rendered yet', () => {
            const container = document.createElement('div');

            document.querySelector = jest.fn().mockReturnValue(container);

            extensionMessenger = new ExtensionMessenger(store, {}, {});

            expect(() => extensionMessenger.post(extension.id, event.data)).toThrow(
                ExtensionNotFoundError,
            );
        });

        it('should post to an extension', () => {
            const container = document.createElement('div');
            const iframe = document.createElement('iframe');

            container.appendChild(iframe);

            const poster = new IframeEventPoster(extension.url, window);
            const posters = {
                [extension.id]: poster,
            };

            extensionMessenger = new ExtensionMessenger(store, {}, posters);

            document.querySelector = jest.fn().mockReturnValue(container);

            jest.spyOn(iframe, 'contentWindow', 'get').mockReturnValue(window);
            jest.spyOn(poster, 'post');

            extensionMessenger.post(extension.id, event.data);

            expect(poster.post).toHaveBeenCalledWith(event.data);
        });
    });
});
