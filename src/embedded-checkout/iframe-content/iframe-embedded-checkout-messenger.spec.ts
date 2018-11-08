import { CartChangedError } from '../../cart/errors';
import { StandardError } from '../../common/error/errors';
import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventType } from '../embedded-checkout-events';
import IframeEventListener from '../iframe-event-listener';
import IframeEventPoster from '../iframe-event-poster';

import { EmbeddedContentEventMap, EmbeddedContentEventType } from './embedded-content-events';
import IframeEmbeddedCheckoutMessenger from './iframe-embedded-checkout-messenger';

describe('EmbeddedCheckoutMessenger', () => {
    let messenger: IframeEmbeddedCheckoutMessenger;
    let messageListener: IframeEventListener<EmbeddedContentEventMap>;
    let messagePoster: IframeEventPoster<EmbeddedCheckoutEvent>;
    let parentWindow: Window;

    beforeEach(() => {
        const parentOrigin = 'https://foobar.mybigcommerece.com';

        parentWindow = Object.create(window);
        messageListener = new IframeEventListener<EmbeddedContentEventMap>(parentOrigin);
        messagePoster = new IframeEventPoster<EmbeddedCheckoutEvent>(parentOrigin, parentWindow);

        jest.spyOn(messagePoster, 'post');
        jest.spyOn(messageListener, 'addListener');

        messenger = new IframeEmbeddedCheckoutMessenger(messageListener, messagePoster);
    });

    it('posts `complete` event to parent window', () => {
        messenger.postComplete();

        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.CheckoutComplete,
        });
    });

    it('posts `complete` event to parent window', () => {
        const error = new CartChangedError();

        messenger.postError(error);

        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload: {
                message: error.message,
                type: error.type,
            },
        });
    });

    it('posts `loaded` event to parent window', () => {
        messenger.postLoaded();

        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.CheckoutLoaded,
        });
    });

    it('posts `frame_loaded` event to parent window', () => {
        messenger.postFrameLoaded();

        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.FrameLoaded,
        });
    });

    it('posts `frame_error` event to parent window', () => {
        const error = new StandardError();

        messenger.postFrameError(error);

        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.FrameError,
            payload: {
                message: error.message,
                type: error.type,
            },
        });
    });

    it('posts `signed_out` event to parent window', () => {
        messenger.postSignedOut();

        expect(messagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.SignedOut,
        });
    });

    it('listens to `style_configured` event from parent window', () => {
        const handler = jest.fn();
        const styles = { body: { backgroundColor: '#00ff00' } };

        messenger.receiveStyles(handler);
        messageListener.trigger({
            type: EmbeddedContentEventType.StyleConfigured,
            payload: styles,
        });

        expect(messageListener.addListener)
            .toHaveBeenCalledWith(EmbeddedContentEventType.StyleConfigured, expect.any(Function));

        expect(handler).toHaveBeenCalledWith(styles);
    });
});
