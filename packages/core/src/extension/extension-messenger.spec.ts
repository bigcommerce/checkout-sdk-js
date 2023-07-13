import { ExtensionNotFoundError } from './errors';
import { Extension } from './extension';
import { ExtensionCommandHandlers } from './extension-command-handler';
import { ExtensionMessenger } from './extension-messenger';
import { ExtensionOriginEvent } from './extension-origin-event';
import {
    getExtensionCommandHandlers,
    getExtensionMessageEvent,
    getExtensions,
} from './extension.mock';

describe('ExtensionMessenger', () => {
    let extensionMessenger: ExtensionMessenger;
    let extensions: Extension[];
    let extensionCommandHandlers: ExtensionCommandHandlers;
    let event: {
        origin: string;
        data: ExtensionOriginEvent;
    };

    beforeEach(() => {
        extensions = getExtensions();
        extensionMessenger = new ExtensionMessenger();
        extensionCommandHandlers = getExtensionCommandHandlers();
        event = getExtensionMessageEvent();
    });

    describe('#listen() and #stopListen()', () => {
        it('should add event listener', () => {
            window.addEventListener = jest.fn();

            extensionMessenger.listen(extensions, extensions[0].id, extensionCommandHandlers);

            expect(window.addEventListener).toHaveBeenCalled();
        });

        it('should remove event listener', () => {
            window.removeEventListener = jest.fn();

            extensionMessenger.listen(extensions, extensions[0].id, extensionCommandHandlers);
            extensionMessenger.stopListen(extensions[0].id, extensionCommandHandlers);

            expect(window.removeEventListener).toHaveBeenCalled();
        });
    });

    describe('#post()', () => {
        beforeEach(() => {
            extensionMessenger.listen(extensions, extensions[0].id, extensionCommandHandlers);
        });

        it('should throw ExtensionNotFoundError if extensionId is provided but no extension is found', () => {
            expect(() => extensionMessenger.post('567', event.data)).toThrow(
                ExtensionNotFoundError,
            );
        });

        it('should throw ExtensionNotFoundError if the extension is not rendered yet', () => {
            expect(() => extensionMessenger.post(extensions[0].id, event.data)).toThrow(
                ExtensionNotFoundError,
            );
        });

        it('should post to an extension', () => {
            const extensionId = extensions[0].id;
            const extensionMessengerMock: any = extensionMessenger;

            extensionMessengerMock._posters[extensionId] = jest.fn();
            extensionMessengerMock._posters[extensionId].post = jest.fn();

            const container = document.createElement('div');
            const iframe = document.createElement('iframe');

            container.appendChild(iframe);

            document.querySelector = jest.fn().mockReturnValue(container);
            jest.spyOn(iframe, 'contentWindow', 'get').mockReturnValue(window);

            extensionMessenger.post(extensionId, event.data);

            expect(extensionMessengerMock._posters[extensionId].post).toHaveBeenCalledWith(
                event.data,
            );
        });
    });
});
