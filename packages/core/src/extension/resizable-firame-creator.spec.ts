import { EventEmitter } from 'events';

import * as iframeModule from '../common/iframe';

import { ExtensionNotLoadedError } from './errors';
import { Extension } from './extension';
import { ExtensionInternalCommandType } from './extension-internal-commands';
import { getExtensions } from './extension.mock';
import ResizableIframeCreator from './resizable-iframe-creator';

describe('ResizableIframeCreator', () => {
    let url: string;
    let container: HTMLElement;
    let eventEmitter: EventEmitter;
    let extension: Extension;
    let iframeCreator: ResizableIframeCreator;
    let initCallback: () => void;
    let failedCallback: () => void;

    beforeEach(() => {
        extension = getExtensions()[0];
        url = 'http://mybigcommerce.com/checkout';
        container = document.createElement('div');
        eventEmitter = new EventEmitter();
        initCallback = jest.fn();
        failedCallback = jest.fn();

        jest.spyOn(window, 'addEventListener').mockImplementation((type, eventListener) => {
            const listener =
                typeof eventListener === 'function' ? eventListener : () => eventListener;

            return eventEmitter.addListener(type, listener);
        });

        jest.spyOn(window, 'removeEventListener').mockImplementation((type, eventListener) => {
            const listener =
                typeof eventListener === 'function' ? eventListener : () => eventListener;

            return eventEmitter.removeListener(type, listener);
        });

        container.setAttribute('id', 'checkout');
        container.setAttribute('data-extension-id', extension.id);
        window.document.body.innerHTML = '';
        window.document.body.appendChild(container);

        iframeCreator = new ResizableIframeCreator({
            timeout: 0,
        });
    });

    it('removes message listener if iframe is loaded successfully', async () => {
        jest.spyOn(window, 'removeEventListener');

        setTimeout(() => {
            eventEmitter.emit('message', {
                origin: 'http://mybigcommerce.com',
                data: { type: ExtensionInternalCommandType.ResizeIframe },
            });
            eventEmitter.emit('message', {
                origin: 'http://mybigcommerce.com',
                data: '[iFrameSizer]iFrameResizer0:0:0:init',
            });
        });

        await iframeCreator.createFrame(url, 'checkout', initCallback, failedCallback);

        expect(window.removeEventListener).toHaveBeenCalledWith('message', expect.any(Function));
        expect(initCallback).toHaveBeenCalled();
        expect(failedCallback).not.toHaveBeenCalled();
    });

    it('inserts checkout iframe into container', async () => {
        setTimeout(() => {
            eventEmitter.emit('message', {
                origin: 'http://mybigcommerce.com',
                data: { type: ExtensionInternalCommandType.ResizeIframe },
            });
        });

        const frame = await iframeCreator.createFrame(
            url,
            'checkout',
            initCallback,
            failedCallback,
        );

        expect(frame.tagName).toBe('IFRAME');
        expect(frame.src).toEqual(url);
        expect(frame.parentElement).toEqual(container);
    });

    it('configures iframe to be borderless and auto-resizable', async () => {
        jest.spyOn(iframeModule, 'iframeResizer');

        setTimeout(() => {
            eventEmitter.emit('message', {
                origin: 'http://mybigcommerce.com',
                data: { type: ExtensionInternalCommandType.ResizeIframe },
            });
        });

        const frame = await iframeCreator.createFrame(
            url,
            'checkout',
            initCallback,
            failedCallback,
        );

        expect(frame.style.border).toBe('');
        expect(frame.style.width).toBe('100%');
        expect(frame.iFrameResizer).toBeDefined();
        expect(iframeModule.iframeResizer).toHaveBeenCalledWith(
            {
                autoResize: false,
                scrolling: false,
                sizeWidth: false,
                heightCalculationMethod: 'bodyOffset',
                initCallback: expect.any(Function),
            },
            frame,
        );
    });

    it('throws error if unable to find container element', () => {
        expect(() =>
            iframeCreator.createFrame(url, 'invalid_container', initCallback, failedCallback),
        ).toThrow(ExtensionNotLoadedError);
    });

    it('throws error if not receiving "loaded" event within certain timeframe', async () => {
        try {
            await iframeCreator.createFrame(url, 'checkout', initCallback, failedCallback);
        } catch (error) {
            expect(error).toBeInstanceOf(ExtensionNotLoadedError);
            expect(initCallback).not.toHaveBeenCalled();
            expect(failedCallback).toHaveBeenCalled();
        }
    });

    it('removes iframe from container element if unable to load', async () => {
        try {
            await iframeCreator.createFrame(url, 'checkout', initCallback, failedCallback);
        } catch (error) {
            expect(container.childNodes).toHaveLength(0);
        }
    });

    it('removes message listener if unable to load', async () => {
        jest.spyOn(window, 'removeEventListener');

        try {
            await iframeCreator.createFrame(url, 'checkout', initCallback, failedCallback);
        } catch (error) {
            expect(window.removeEventListener).toHaveBeenCalledWith(
                'message',
                expect.any(Function),
            );
        }
    });
});
