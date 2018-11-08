import { iframeResizer, IFrameComponent } from 'iframe-resizer';

import EmbeddedCheckout from './embedded-checkout';
import { EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import EmbeddedCheckoutStyles from './embedded-checkout-styles';
import { NotEmbeddableError } from './errors';
import { EmbeddedContentEvent, EmbeddedContentEventType } from './iframe-content/embedded-content-events';
import IframeEventListener from './iframe-event-listener';
import IframeEventPoster from './iframe-event-poster';
import LoadingIndicator from './loading-indicator';
import ResizableIframeCreator from './resizable-iframe-creator';

describe('EmbeddedCheckout', () => {
    let embeddedCheckout: EmbeddedCheckout;
    let iframe: IFrameComponent;
    let iframeCreator: ResizableIframeCreator;
    let loadingIndicator: LoadingIndicator;
    let messageListener: IframeEventListener<EmbeddedCheckoutEventMap>;
    let messagePoster: IframeEventPoster<EmbeddedContentEvent>;
    let options: EmbeddedCheckoutOptions;
    let styles: EmbeddedCheckoutStyles;

    beforeEach(() => {
        options = {
            url: 'https://mybigcommerce.com/checkout',
            containerId: 'checkout',
        };

        styles = {
            body: {
                backgroundColor: '#000',
            },
        };

        iframe = iframeResizer({}, document.body.appendChild(document.createElement('iframe')))[0];
        iframeCreator = new ResizableIframeCreator();
        messageListener = new IframeEventListener('https://mybigcommerce.com');
        messagePoster = new IframeEventPoster('https://mybigcommerce.com');
        loadingIndicator = new LoadingIndicator();

        jest.spyOn(iframeCreator, 'createFrame')
            .mockReturnValue(Promise.resolve(iframe));

        jest.spyOn(loadingIndicator, 'show')
            .mockImplementation(() => {});

        jest.spyOn(loadingIndicator, 'hide')
            .mockImplementation(() => {});

        embeddedCheckout = new EmbeddedCheckout(
            iframeCreator,
            messageListener,
            messagePoster,
            loadingIndicator,
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
                    type: EmbeddedCheckoutEventType.FrameError,
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
            onSignOut: jest.fn(),
        };

        embeddedCheckout = new EmbeddedCheckout(
            iframeCreator,
            messageListener,
            messagePoster,
            loadingIndicator,
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

        expect(messageListener.addListener)
            .toHaveBeenCalledWith(EmbeddedCheckoutEventType.SignedOut, options.onSignOut);
    });

    it('configures styles when iframe is loaded', async () => {
        options = { ...options, styles };
        embeddedCheckout = new EmbeddedCheckout(
            iframeCreator,
            messageListener,
            messagePoster,
            loadingIndicator,
            options
        );

        jest.spyOn(messagePoster, 'post');

        await embeddedCheckout.attach();

        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedContentEventType.StyleConfigured,
            payload: styles,
        });
    });

    it('reconfigures styles when iframe is reloaded again', async () => {
        options = { ...options, styles };
        embeddedCheckout = new EmbeddedCheckout(
            iframeCreator,
            messageListener,
            messagePoster,
            loadingIndicator,
            options
        );

        jest.spyOn(messagePoster, 'post');

        await embeddedCheckout.attach();

        messageListener.trigger({ type: EmbeddedCheckoutEventType.FrameLoaded });

        expect(messagePoster.post).toHaveBeenCalledTimes(2);
        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedContentEventType.StyleConfigured,
            payload: styles,
        });
    });

    it('toggles loading indicator', done => {
        embeddedCheckout.attach()
            .then(() => {
                expect(loadingIndicator.hide).toHaveBeenCalled();
                done();
            });

        expect(loadingIndicator.show).toHaveBeenCalled();
        expect(loadingIndicator.hide).not.toHaveBeenCalled();
    });
});
