import { CartChangedError } from '../../cart/errors';
import { IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventType } from '../embedded-checkout-events';

import { EmbeddedContentEventMap, EmbeddedContentEventType } from './embedded-content-events';
import IframeEmbeddedCheckoutMessenger from './iframe-embedded-checkout-messenger';

describe('EmbeddedCheckoutMessenger', () => {
    let messenger: IframeEmbeddedCheckoutMessenger;
    let messageListener: IframeEventListener<EmbeddedContentEventMap>;
    let messagePoster: IframeEventPoster<EmbeddedCheckoutEvent>;
    let untargetedMessagePoster: IframeEventPoster<EmbeddedCheckoutEvent>;
    let parentWindow: Window;

    beforeEach(() => {
        const parentOrigin = 'https://foobar.mybigcommerece.com';

        parentWindow = Object.create(window);
        messageListener = new IframeEventListener<EmbeddedContentEventMap>(parentOrigin);
        messagePoster = new IframeEventPoster<EmbeddedCheckoutEvent>(parentOrigin, parentWindow);
        untargetedMessagePoster = new IframeEventPoster<EmbeddedCheckoutEvent>('*', parentWindow);

        jest.spyOn(messagePoster, 'post');
        jest.spyOn(untargetedMessagePoster, 'post');
        jest.spyOn(messageListener, 'addListener');

        messenger = new IframeEmbeddedCheckoutMessenger(
            messageListener,
            messagePoster,
            untargetedMessagePoster
        );
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

    it('posts `frame_error` event to parent window without target origin', () => {
        const error = new Error();

        messenger.postFrameError(error);

        expect(untargetedMessagePoster.post).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.FrameError,
            payload: {
                message: error.message,
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

    it('invokes message callbacks if registered', () => {
        const handler = jest.fn();

        messenger = new IframeEmbeddedCheckoutMessenger(
            messageListener,
            messagePoster,
            untargetedMessagePoster,
            { [EmbeddedCheckoutEventType.FrameLoaded]: handler }
        );

        messenger.postFrameLoaded({ contentId: 'foobar' });

        expect(handler).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.FrameLoaded,
            payload: { contentId: 'foobar' },
        });
    });

    it('does not invoke message callback if it does not match with type of event', () => {
        const handler = jest.fn();

        messenger = new IframeEmbeddedCheckoutMessenger(
            messageListener,
            messagePoster,
            untargetedMessagePoster,
            { [EmbeddedCheckoutEventType.FrameLoaded]: handler }
        );

        messenger.postFrameError(new Error('Unexpected error'));

        expect(handler)
            .not.toHaveBeenCalled();
    });

    it('has methods that can be destructed', () => {
        const { postComplete } = messenger;

        expect(() => postComplete())
            .not.toThrow(TypeError);
    });
});
