import EventEmitter from 'events';

import { createCheckoutStore, ReadableCheckoutStore } from '../checkout';
import { getCheckoutStoreState } from '../checkout/checkouts.mock';
import { IframeEventListener, IframeEventPoster } from '../common/iframe';

import {
    ExtensionNotFoundError,
    UnsupportedExtensionCommandError,
    UnsupportedExtensionQueryError,
} from './errors';
import { Extension } from './extension';
import { ExtensionCommandMap, ExtensionCommandType } from './extension-commands';
import { ExtensionEvent } from './extension-events';
import { ExtensionMessenger } from './extension-messenger';
import { ExtensionQueryMap, ExtensionQueryType } from './extension-queries';
import { getExtensionEvent, getExtensions } from './extension.mock';

describe('ExtensionMessenger', () => {
    let extensionCommandHandler: jest.Mock;
    let extensionQueryHandler: jest.Mock;
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
        extensionQueryHandler = jest.fn();
    });

    describe('#listenForCommand', () => {
        let listener: IframeEventListener<ExtensionCommandMap>;

        beforeEach(() => {
            listener = new IframeEventListener(extension.url);

            const listeners = {
                [extension.id]: listener,
            };

            extensionMessenger = new ExtensionMessenger(store, listeners, {}, {});
        });

        it('should throw if unable to find the extension', () => {
            expect(() =>
                extensionMessenger.listenForCommand(
                    'xxx',
                    ExtensionCommandType.ReloadCheckout,
                    extensionCommandHandler,
                ),
            ).toThrow(ExtensionNotFoundError);
        });

        it('should throw if trying to listen for an unsupported command', () => {
            expect(() =>
                extensionMessenger.listenForCommand(
                    extension.id,
                    'INVALID_COMMAND' as ExtensionCommandType,
                    extensionCommandHandler,
                ),
            ).toThrow(UnsupportedExtensionCommandError);
        });

        it('should listen and add an event listener', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionCommandType.ReloadCheckout) {
                        listener({ type }, context);
                    }
                });
            });

            extensionMessenger.listenForCommand(
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
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionCommandType.ReloadCheckout) {
                        listener({ type }, context);
                    }
                });
            });

            extensionMessenger.listenForCommand(
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
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionCommandType.ReloadCheckout) {
                        listener({ type }, context);
                    }
                });
            });

            jest.spyOn(listener, 'removeListener').mockImplementation((type) => {
                eventEmitter.removeAllListeners(type);
            });

            const remover = extensionMessenger.listenForCommand(
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

            extensionMessenger.listenForCommand(
                extension.id,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            extensionMessenger.stopListen(extension.id);

            // FIXME
            expect(listener.stopListen).toHaveBeenCalled();
        });
    });

    describe('#listenForQuery', () => {
        let listener: IframeEventListener<ExtensionQueryMap>;

        beforeEach(() => {
            listener = new IframeEventListener(extension.url);

            const listeners = {
                [extension.id]: listener,
            };

            extensionMessenger = new ExtensionMessenger(store, {}, listeners, {});
        });

        it('should throw if unable to find the extension', () => {
            expect(() =>
                extensionMessenger.listenForQuery(
                    'xxx',
                    ExtensionQueryType.GetConsignments,
                    extensionQueryHandler,
                ),
            ).toThrow(ExtensionNotFoundError);
        });

        it('should throw if trying to listen for an unsupported command', () => {
            expect(() =>
                extensionMessenger.listenForQuery(
                    extension.id,
                    'INVALID_QUERY' as ExtensionQueryType,
                    extensionQueryHandler,
                ),
            ).toThrow(UnsupportedExtensionQueryError);
        });

        it('should listen and add an event listener', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionQueryType.GetConsignments) {
                        listener({ type }, context);
                    }
                });
            });

            extensionMessenger.listenForQuery(
                extension.id,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { extensionId: extension.id },
            });

            expect(extensionQueryHandler).toHaveBeenCalledWith(
                { type: ExtensionQueryType.GetConsignments },
                { extensionId: extension.id },
            );
        });

        it('should listen to commands emitted by same extension', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionQueryType.GetConsignments) {
                        listener({ type }, context);
                    }
                });
            });

            extensionMessenger.listenForQuery(
                extension.id,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { extensionId: extension.id },
            });

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { extensionId: getExtensions()[1].id },
            });

            expect(extensionQueryHandler).toHaveBeenCalledTimes(1);
        });

        it('should remove the event listener', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionQueryType.GetConsignments) {
                        listener({ type }, context);
                    }
                });
            });

            jest.spyOn(listener, 'removeListener').mockImplementation((type) => {
                eventEmitter.removeAllListeners(type);
            });

            const remover = extensionMessenger.listenForQuery(
                extension.id,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            remover();

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { extensionId: extension.id },
            });

            expect(extensionQueryHandler).not.toHaveBeenCalled();
        });

        it('should stop listening', () => {
            jest.spyOn(listener, 'stopListen');

            extensionMessenger.listenForQuery(
                extension.id,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            extensionMessenger.stopListen(extension.id);

            // FIXME
            expect(listener.stopListen).toHaveBeenCalled();
        });
    });

    describe('#post()', () => {
        it('should log out the error if an extension has not yet been rendered', () => {
            document.querySelector = jest.fn().mockReturnValue(undefined);

            extensionMessenger = new ExtensionMessenger(store, {}, {}, {});

            jest.spyOn(extensionMessenger, 'clearCacheById');
            jest.spyOn(console, 'log');

            extensionMessenger.post(extension.id, event.data);

            expect(extensionMessenger.clearCacheById).toHaveBeenCalledWith(extension.id);
            // eslint-disable-next-line no-console
            expect(console.log).toHaveBeenCalled();
        });

        it('should post to an extension', () => {
            const container = document.createElement('div');
            const iframe = document.createElement('iframe');

            container.appendChild(iframe);

            const poster = new IframeEventPoster(extension.url, window);
            const posters = {
                [extension.id]: poster,
            };

            extensionMessenger = new ExtensionMessenger(store, {}, {}, posters);

            document.querySelector = jest.fn().mockReturnValue(container);

            jest.spyOn(iframe, 'contentWindow', 'get').mockReturnValue(window);
            jest.spyOn(poster, 'post');

            extensionMessenger.post(extension.id, event.data);

            expect(poster.post).toHaveBeenCalledWith(event.data);
        });
    });
});
