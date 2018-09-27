import { iframeResizer, IFrameComponent } from 'iframe-resizer';

import EmbeddedCheckout from './embedded-checkout';
import { EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutListener from './embedded-checkout-listener';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import { NotEmbeddableError } from './errors';
import ResizableIframeCreator from './resizable-iframe-creator';

describe('EmbeddedCheckout', () => {
    let embeddedCheckout: EmbeddedCheckout;
    let iframe: IFrameComponent;
    let iframeCreator: ResizableIframeCreator;
    let messageListener: EmbeddedCheckoutListener;
    let options: EmbeddedCheckoutOptions;

    beforeEach(() => {
        options = {
            url: 'https://mybigcommerce.com/checkout',
            containerId: 'checkout',
        };

        iframeCreator = new ResizableIframeCreator();
        messageListener = new EmbeddedCheckoutListener('https://mybigcommerce.com');

        jest.spyOn(iframeCreator, 'createFrame')
            .mockImplementation(() => {
                iframe = iframeResizer({}, document.body.appendChild(document.createElement('iframe')))[0];

                return Promise.resolve(iframe);
            });

        embeddedCheckout = new EmbeddedCheckout(
            iframeCreator,
            messageListener,
            options
        );
    });

    it('creates iframe element', async () => {
        await embeddedCheckout.attach();

        expect(iframeCreator.createFrame)
            .toHaveBeenCalledWith(options.url, options.containerId);
    });

    it('listens to checkout events', async () => {
        jest.spyOn(messageListener, 'listen');

        await embeddedCheckout.attach();

        expect(messageListener.listen)
            .toHaveBeenCalled();
    });

    it('triggers error callback when there is error', async () => {
        const error = new NotEmbeddableError();

        jest.spyOn(iframeCreator, 'createFrame')
            .mockReturnValue(Promise.reject(error));

        jest.spyOn(messageListener, 'trigger');

        try {
            await embeddedCheckout.attach();
        } catch (thrown) {
            expect(messageListener.trigger)
                .toHaveBeenCalledWith({
                    type: EmbeddedCheckoutEventType.CheckoutError,
                    payload: error,
                });

            expect(thrown).toEqual(error);
        }
    });

    it('removes iframe from DOM tree', async () => {
        await embeddedCheckout.attach();

        jest.spyOn(iframe.iFrameResizer, 'close');

        embeddedCheckout.detach();

        expect(iframe.iFrameResizer.close).toHaveBeenCalled();
    });

    it('stops listening to checkout events', async () => {
        jest.spyOn(messageListener, 'stopListen');

        await embeddedCheckout.attach();

        embeddedCheckout.detach();

        expect(messageListener.stopListen).toHaveBeenCalled();
    });

    it('only creates iframe once until it is detached', async () => {
        await embeddedCheckout.attach();
        await embeddedCheckout.attach();

        expect(iframeCreator.createFrame)
            .toHaveBeenCalledTimes(1);

        embeddedCheckout.detach();

        await embeddedCheckout.attach();

        expect(iframeCreator.createFrame)
            .toHaveBeenCalledTimes(2);
    });

    it('can retry if unable to attach for first time', async () => {
        jest.spyOn(iframeCreator, 'createFrame')
            .mockReturnValueOnce(Promise.reject(new NotEmbeddableError()));

        await embeddedCheckout.attach().catch(() => {});
        await embeddedCheckout.attach().catch(() => {});

        expect(iframeCreator.createFrame)
            .toHaveBeenCalledTimes(2);
    });

    it('listens to checkout events when callbacks are passed', () => {
        jest.spyOn(messageListener, 'addListener');

        options = {
            ...options,
            onComplete: jest.fn(),
            onError: jest.fn(),
            onFrameLoad: jest.fn(),
            onLoad: jest.fn(),
        };

        embeddedCheckout = new EmbeddedCheckout(
            iframeCreator,
            messageListener,
            options
        );

        expect(messageListener.addListener)
            .toHaveBeenCalledWith(EmbeddedCheckoutEventType.CheckoutComplete, options.onComplete);

        expect(messageListener.addListener)
            .toHaveBeenCalledWith(EmbeddedCheckoutEventType.CheckoutError, options.onError);

        expect(messageListener.addListener)
            .toHaveBeenCalledWith(EmbeddedCheckoutEventType.CheckoutLoaded, options.onLoad);

        expect(messageListener.addListener)
            .toHaveBeenCalledWith(EmbeddedCheckoutEventType.FrameLoaded, options.onFrameLoad);
    });

    it('listens to specific checkout event', () => {
        const handeLoad = jest.fn();

        jest.spyOn(messageListener, 'addListener');

        embeddedCheckout.on(EmbeddedCheckoutEventType.CheckoutLoaded, handeLoad);

        expect(messageListener.addListener)
            .toHaveBeenCalledWith(EmbeddedCheckoutEventType.CheckoutLoaded, handeLoad);
    });

    it('removes specific checkout event listener', () => {
        const handeLoad = jest.fn();

        jest.spyOn(messageListener, 'removeListener');

        embeddedCheckout.off(EmbeddedCheckoutEventType.CheckoutLoaded, handeLoad);

        expect(messageListener.removeListener)
            .toHaveBeenCalledWith(EmbeddedCheckoutEventType.CheckoutLoaded, handeLoad);
    });
});
