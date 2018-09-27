import { EventEmitter } from 'events';

import { EmbeddedCheckoutEventType } from './embedded-checkout-events';
import { NotEmbeddableError } from './errors';
import ResizableIframeCreator from './resizable-iframe-creator';

describe('iframeCreator.createFrame()', () => {
    let url: string;
    let container: HTMLElement;
    let eventEmitter: EventEmitter;
    let iframeCreator: ResizableIframeCreator;

    beforeEach(() => {
        url = 'http://mybigcommerce.com/checkout';
        container = document.createElement('div');
        eventEmitter = new EventEmitter();

        jest.spyOn(window, 'addEventListener')
            .mockImplementation((type, listener) => {
                return eventEmitter.addListener(type, listener);
            });

        jest.spyOn(window, 'removeEventListener')
            .mockImplementation((type, listener) => {
                return eventEmitter.removeListener(type, listener);
            });

        container.setAttribute('id', 'checkout');
        window.document.body.appendChild(container);

        iframeCreator = new ResizableIframeCreator({
            timeout: 0,
        });
    });

    it('inserts checkout iframe into container', async () => {
        setTimeout(() => {
            eventEmitter.emit('message', {
                origin: 'http://mybigcommerce.com',
                data: { type: EmbeddedCheckoutEventType.FrameLoaded },
            });
        });

        const frame = await iframeCreator.createFrame(url, 'checkout');

        expect(frame.tagName).toEqual('IFRAME');
        expect(frame.src).toEqual(url);
        expect(frame.parentElement).toEqual(container);
    });

    it('configures iframe to be borderless and auto-resizable', async () => {
        setTimeout(() => {
            eventEmitter.emit('message', {
                origin: 'http://mybigcommerce.com',
                data: { type: EmbeddedCheckoutEventType.FrameLoaded },
            });
        });

        const frame = await iframeCreator.createFrame(url, 'checkout');

        expect(frame.style.border).toEqual('');
        expect(frame.style.width).toEqual('100%');
        expect(frame.iFrameResizer).toBeDefined();
    });

    it('throws error if unable to find container element', () => {
        expect(() => iframeCreator.createFrame(url, 'invalid_container')).toThrow(NotEmbeddableError);
    });

    it('throws error if not receiving "loaded" event within certain timeframe', async () => {
        try {
            await iframeCreator.createFrame(url, 'checkout');
        } catch (error) {
            expect(error).toBeInstanceOf(NotEmbeddableError);
        }
    });

    it('removes iframe from container element if unable to load', async () => {
        try {
            await iframeCreator.createFrame(url, 'checkout');
        } catch (error) {
            expect(container.childNodes.length).toEqual(0);
        }
    });
});
