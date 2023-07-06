import { EventEmitter } from 'events';

import { IframeEventPoster } from '../common/iframe';

import { ExtensionNotFoundError } from './errors';
import { Extension } from './extension';
import { ExtensionCommandHandlers } from './extension-command-handler';
import { ExtensionMessenger } from './extension-messenger';
import { ExtensionPostEvent } from './extension-post-event';
import {
    getExtensionCommandHandlers,
    getExtensionMessageEvent,
    getExtensions,
} from './extension.mock';

describe('ExtensionMessenger', () => {
    let extensionMessenger: ExtensionMessenger;
    let extensions: Extension[];
    let extensionCommandHandlers: ExtensionCommandHandlers;
    let eventEmitter: EventEmitter;
    let event: {
        origin: string;
        data: ExtensionPostEvent;
    };
    let poster: IframeEventPoster<ExtensionPostEvent>;

    beforeEach(() => {
        extensions = getExtensions();
        poster = new IframeEventPoster<ExtensionPostEvent>('*');
        extensionMessenger = new ExtensionMessenger(poster, extensions);
        extensionCommandHandlers = getExtensionCommandHandlers();
        eventEmitter = new EventEmitter();
        event = getExtensionMessageEvent();
    });

    describe('#listen()', () => {
        beforeEach(() => {
            window.addEventListener = jest.fn();
        });

        it('should add event listener', () => {
            extensionMessenger.listen(extensionCommandHandlers);

            expect(window.addEventListener).toHaveBeenCalledTimes(1);
        });

        it('should not add event listener if already listening', () => {
            extensionMessenger.listen(extensionCommandHandlers);
            extensionMessenger.listen(extensionCommandHandlers);

            expect(window.addEventListener).toHaveBeenCalledTimes(1);
        });
    });

    describe('#post()', () => {
        beforeEach(() => {
            jest.spyOn(poster, 'post');
            jest.spyOn(poster, 'setTargetOrigin');
        });

        it('should post to the host if no extensionId is provided', () => {
            Object.defineProperty(window.document, 'referrer', {
                value: 'https://checkout.store',
            });

            extensionMessenger.post(event.data);

            expect(poster.setTargetOrigin).toHaveBeenCalledWith(window.document.referrer);
            expect(poster.post).toHaveBeenCalledWith(event.data);

            jest.resetAllMocks();
        });

        it('should post to an extension if extensionId is provided', () => {
            const container = document.createElement('div');
            const iframe = document.createElement('iframe');

            container.appendChild(iframe);

            document.querySelector = jest.fn().mockReturnValue(container);
            jest.spyOn(iframe, 'contentWindow', 'get').mockReturnValue(window);

            extensionMessenger.post(event.data, '123');

            expect(poster.setTargetOrigin).not.toHaveBeenCalledWith(window.parent.origin);
            expect(poster.post).toHaveBeenCalledWith(event.data);

            jest.resetAllMocks();
        });

        it('should throw ExtensionNotFoundError if extensionId is provided but no extension is found', () => {
            expect(() => extensionMessenger.post(event.data, '567')).toThrow(
                ExtensionNotFoundError,
            );
        });

        it('should throw ExtensionNotFoundError if the extension is not rendered yet', () => {
            expect(() => extensionMessenger.post(event.data, '123')).toThrow(
                ExtensionNotFoundError,
            );
        });

        it('should post to host if no extensionId is provided', () => {
            Object.defineProperty(window.document, 'referrer', {
                value: 'https://checkout.store',
            });

            event = {
                ...event,
                data: {
                    type: 'HOST_COMMAND',
                    payload: {
                        message: 'SAMPLE',
                    },
                },
            };

            extensionMessenger.post(event.data);

            expect(poster.setTargetOrigin).toHaveBeenCalledWith(window.document.referrer);
            expect(poster.post).toHaveBeenCalledWith(event.data);
        });
    });

    describe('#handleMessage() and #trigger()', () => {
        beforeEach(() => {
            jest.spyOn(window, 'addEventListener').mockImplementation((type, listener) => {
                return eventEmitter.addListener(type, listener);
            });

            extensionMessenger.listen(extensionCommandHandlers);
        });

        it('should trigger extension command handler if extension and origin match', () => {
            eventEmitter.emit('message', event);

            expect(extensionCommandHandlers[event.data.type]).toHaveBeenCalledWith(event.data);
        });

        it('should not trigger extension command handler if extension does not exist', () => {
            eventEmitter.emit('message', {
                ...event,
                data: {
                    ...event.data,
                    payload: {
                        extensionId: 'not exist',
                    },
                },
            });

            expect(extensionCommandHandlers[event.data.type]).not.toHaveBeenCalled();
        });

        it('should not trigger extension command handler if origin does not match', () => {
            eventEmitter.emit('message', {
                ...event,
                origin: 'not.right',
            });

            expect(extensionCommandHandlers[event.data.type]).not.toHaveBeenCalled();
        });

        it('should not trigger extension command handler if extensionId is missing', () => {
            eventEmitter.emit('message', {
                ...event,
                data: {
                    ...event.data,
                    payload: {},
                },
            });

            expect(extensionCommandHandlers[event.data.type]).not.toHaveBeenCalled();
        });
    });
});
