import { createRequestSender, RequestSender } from '@bigcommerce/request-sender';

import { getErrorResponse, getResponse } from '../common/http-request/responses.mock';
import { iframeResizer, IFrameComponent } from '../common/iframe';
import { BrowserStorage } from '../common/storage';

import EmbeddedCheckout, { ALLOW_COOKIE_ATTEMPT_INTERVAL, IS_COOKIE_ALLOWED_KEY, LAST_ALLOW_COOKIE_ATTEMPT_KEY } from './embedded-checkout';
import { EmbeddedCheckoutEventMap, EmbeddedCheckoutEventType } from './embedded-checkout-events';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import EmbeddedCheckoutStyles from './embedded-checkout-styles';
import { InvalidLoginTokenError, NotEmbeddableError, NotEmbeddableErrorType } from './errors';
import { EmbeddedContentEvent, EmbeddedContentEventType } from './iframe-content';
import IframeEventListener from './iframe-event-listener';
import IframeEventPoster from './iframe-event-poster';
import LoadingIndicator from './loading-indicator';
import ResizableIframeCreator from './resizable-iframe-creator';

describe('EmbeddedCheckout', () => {
    let embeddedCheckout: EmbeddedCheckout;
    let iframe: IFrameComponent;
    let iframeCreator: ResizableIframeCreator;
    let loadingIndicator: LoadingIndicator;
    let location: Location;
    let messageListener: IframeEventListener<EmbeddedCheckoutEventMap>;
    let messagePoster: IframeEventPoster<EmbeddedContentEvent>;
    let requestSender: RequestSender;
    let options: EmbeddedCheckoutOptions;
    let storage: BrowserStorage;
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
        location = window.location;
        requestSender = createRequestSender();
        storage = new BrowserStorage('EmbeddedCheckout');

        jest.spyOn(iframeCreator, 'createFrame')
            .mockReturnValue(Promise.resolve(iframe));

        jest.spyOn(loadingIndicator, 'show')
            .mockImplementation(() => {});

        jest.spyOn(loadingIndicator, 'hide')
            .mockImplementation(() => {});

        jest.spyOn(location, 'replace')
            .mockImplementation(() => {});

        jest.spyOn(storage, 'getItem')
            .mockImplementation(key => key === IS_COOKIE_ALLOWED_KEY ? true : null);

        embeddedCheckout = new EmbeddedCheckout(
            iframeCreator,
            messageListener,
            messagePoster,
            loadingIndicator,
            requestSender,
            storage,
            location,
            options
        );
    });

    afterEach(() => {
        (location.replace as jest.Mock).mockRestore();
        storage.removeItem(IS_COOKIE_ALLOWED_KEY);
        storage.removeItem(LAST_ALLOW_COOKIE_ATTEMPT_KEY);
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
            requestSender,
            storage,
            location,
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
            requestSender,
            storage,
            location,
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
            requestSender,
            storage,
            location,
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

    it('redirects user to allow third party cookie to be set', () => {
        jest.spyOn(storage, 'getItem')
            .mockImplementation(key => key === IS_COOKIE_ALLOWED_KEY ? null : true);

        embeddedCheckout.attach();

        expect(location.replace)
            .toHaveBeenCalledWith(`https://mybigcommerce.com/embedded-checkout/allow-cookie?returnUrl=${encodeURIComponent(location.href)}`);
    });

    it('does not redirect user if cookie is already allowed', () => {
        embeddedCheckout.attach();

        expect(location.replace)
            .not.toHaveBeenCalled();
    });

    it('retries once if cookie is flagged as allowed yet unable to load frame', async () => {
        (storage.getItem as jest.Mock).mockRestore();
        storage.setItem(IS_COOKIE_ALLOWED_KEY, true);

        jest.spyOn(iframeCreator, 'createFrame')
            .mockRejectedValue(new NotEmbeddableError('Empty cart', NotEmbeddableErrorType.MissingContent));

        embeddedCheckout.attach();

        await new Promise(resolve => process.nextTick(resolve));

        expect(location.replace)
            .toHaveBeenCalledWith(`https://mybigcommerce.com/embedded-checkout/allow-cookie?returnUrl=${encodeURIComponent(location.href)}`);
    });

    it('does not retry renew cookie allowance if already retried recently', async () => {
        (storage.getItem as jest.Mock).mockRestore();
        storage.setItem(IS_COOKIE_ALLOWED_KEY, true);
        storage.setItem(LAST_ALLOW_COOKIE_ATTEMPT_KEY, Date.now() - ALLOW_COOKIE_ATTEMPT_INTERVAL);

        jest.spyOn(iframeCreator, 'createFrame')
            .mockRejectedValue(new NotEmbeddableError('Empty cart', NotEmbeddableErrorType.MissingContent));

        embeddedCheckout.attach();

        await new Promise(resolve => process.nextTick(resolve));

        expect(location.replace)
            .toHaveBeenCalledTimes(1);
    });

    it('does not retry to renew cookie allowance if error is due to other issues', async () => {
        (storage.getItem as jest.Mock).mockRestore();
        storage.setItem(IS_COOKIE_ALLOWED_KEY, true);

        jest.spyOn(iframeCreator, 'createFrame')
            .mockRejectedValue(new NotEmbeddableError('Invalid container', NotEmbeddableErrorType.MissingContainer));

        try {
            await embeddedCheckout.attach();
        } catch (thrown) {
            expect(location.replace)
                .not.toBeCalled();
        }
    });

    it('has methods that can be destructed', () => {
        const { attach } = embeddedCheckout;

        expect(() => attach())
            .not.toThrow(TypeError);
    });

    describe('if login URL is passed', () => {
        beforeEach(() => {
            options = {
                ...options,
                url: 'https://mybigcommerce.com/login/token/foobar',
            };
            embeddedCheckout = new EmbeddedCheckout(
                iframeCreator,
                messageListener,
                messagePoster,
                loadingIndicator,
                requestSender,
                storage,
                location,
                options
            );
        });

        it('attempts to login', async () => {
            const response = getResponse({ redirectUrl: 'https://mybigcommerce.com/checkout' });

            jest.spyOn(requestSender, 'post')
                .mockReturnValue(Promise.resolve(response));

            await embeddedCheckout.attach();

            expect(requestSender.post)
                .toHaveBeenCalledWith(options.url);

            expect(iframeCreator.createFrame)
                .toHaveBeenCalledWith(response.body.redirectUrl, options.containerId);
        });

        it('triggers error callback if unable to login', async () => {
            const response = getErrorResponse();

            jest.spyOn(requestSender, 'post')
                .mockReturnValue(Promise.reject(response));

            jest.spyOn(messageListener, 'trigger');

            try {
                await embeddedCheckout.attach();
            } catch (thrown) {
                expect(messageListener.trigger)
                    .toHaveBeenCalledWith({
                        type: EmbeddedCheckoutEventType.FrameError,
                        payload: thrown,
                    });

                expect(thrown).toEqual(new InvalidLoginTokenError(response));
            }
        });
    });
});
