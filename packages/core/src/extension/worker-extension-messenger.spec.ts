import EventEmitter from 'events';

import { WorkerEventListener } from '../common/worker';

import {
    ExtensionNotFoundError,
    UnsupportedExtensionCommandError,
    UnsupportedExtensionQueryError,
} from './errors';
import { ExtensionCommandMap, ExtensionCommandType } from './extension-commands';
import { ExtensionQueryMap, ExtensionQueryType } from './extension-queries';
import { WorkerExtensionMessenger } from './worker-extension-messenger';

jest.mock('../common/worker', () => ({
    WorkerEventListener: jest.fn().mockImplementation(() => ({
        listen: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        stopListen: jest.fn(),
    })),
    WorkerEventPoster: jest.fn().mockImplementation(() => ({
        post: jest.fn(),
    })),
}));

describe('WorkerExtensionMessenger', () => {
    let extensionCommandHandler: jest.Mock;
    let extensionQueryHandler: jest.Mock;
    let messenger: WorkerExtensionMessenger;
    let worker: Worker;

    const extensionId = '12345678-1234-1234-1234-123456789012';

    beforeEach(() => {
        extensionCommandHandler = jest.fn();
        extensionQueryHandler = jest.fn();
        worker = {} as Worker;
    });

    describe('#listenForCommand', () => {
        let listener: WorkerEventListener<ExtensionCommandMap>;

        beforeEach(() => {
            listener = new WorkerEventListener(worker);

            const listeners = {
                [extensionId]: listener,
            };

            messenger = new WorkerExtensionMessenger({ [extensionId]: worker }, listeners, {});
        });

        it('should throw if unable to find the extension', () => {
            expect(() =>
                messenger.listenForCommand(
                    '404',
                    ExtensionCommandType.ReloadCheckout,
                    extensionCommandHandler,
                ),
            ).toThrow(ExtensionNotFoundError);
        });

        it('should throw if trying to listen for an unsupported command', () => {
            expect(() =>
                messenger.listenForCommand(
                    extensionId,
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

            messenger.listenForCommand(
                extensionId,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId },
            });

            expect(extensionCommandHandler).toHaveBeenCalledWith(
                { type: ExtensionCommandType.ReloadCheckout },
                { extensionId },
            );
        });

        it('should listen to commands emitted by the same extension', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionCommandType.ReloadCheckout) {
                        listener({ type }, context);
                    }
                });
            });

            messenger.listenForCommand(
                extensionId,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId },
            });

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId: '404' },
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

            const remover = messenger.listenForCommand(
                extensionId,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            remover();

            eventEmitter.emit(ExtensionCommandType.ReloadCheckout, {
                context: { extensionId },
            });

            expect(extensionCommandHandler).not.toHaveBeenCalled();
        });

        it('should stop listening', () => {
            jest.spyOn(listener, 'stopListen');

            messenger.listenForCommand(
                extensionId,
                ExtensionCommandType.ReloadCheckout,
                extensionCommandHandler,
            );

            messenger.stopListen(extensionId);

            expect(listener.stopListen).toHaveBeenCalled();
        });
    });

    describe('#listenForQuery', () => {
        let listener: WorkerEventListener<ExtensionQueryMap>;

        beforeEach(() => {
            listener = new WorkerEventListener(worker);

            const listeners = {
                [extensionId]: listener,
            };

            messenger = new WorkerExtensionMessenger({ [extensionId]: worker }, {}, listeners);
        });

        it('should throw if unable to find the extension', () => {
            expect(() =>
                messenger.listenForQuery(
                    'xxx',
                    ExtensionQueryType.GetConsignments,
                    extensionQueryHandler,
                ),
            ).toThrow(ExtensionNotFoundError);
        });

        it('should throw if trying to listen for an unsupported command', () => {
            expect(() =>
                messenger.listenForQuery(
                    extensionId,
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

            messenger.listenForQuery(
                extensionId,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { extensionId },
            });

            expect(extensionQueryHandler).toHaveBeenCalledWith(
                { type: ExtensionQueryType.GetConsignments },
                { extensionId },
            );
        });

        it('should listen to queries emitted by the same extension', () => {
            const eventEmitter = new EventEmitter();

            jest.spyOn(listener, 'addListener').mockImplementation((type, listener) => {
                eventEmitter.addListener(type, ({ context }) => {
                    if (type === ExtensionQueryType.GetConsignments) {
                        listener({ type }, context);
                    }
                });
            });

            messenger.listenForQuery(
                extensionId,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { extensionId },
            });

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { extensionId: '404' },
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

            const remover = messenger.listenForQuery(
                extensionId,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            remover();

            eventEmitter.emit(ExtensionQueryType.GetConsignments, {
                context: { [extensionId]: extensionId },
            });

            expect(extensionQueryHandler).not.toHaveBeenCalled();
        });

        it('should stop listening', () => {
            jest.spyOn(listener, 'stopListen');

            messenger.listenForQuery(
                extensionId,
                ExtensionQueryType.GetConsignments,
                extensionQueryHandler,
            );

            messenger.stopListen(extensionId);

            expect(listener.stopListen).toHaveBeenCalled();
        });
    });
});
