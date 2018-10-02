import { CartChangedError } from '../../cart/errors';
import { StandardError } from '../../common/error/errors';
import { EmbeddedCheckoutEventType } from '../embedded-checkout-events';

import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';

describe('EmbeddedCheckoutMessenger', () => {
    let messenger: EmbeddedCheckoutMessenger;
    let parentWindow: Window;
    let parentOrigin: string;

    beforeEach(() => {
        parentWindow = Object.create(window);
        parentOrigin = 'https://foobar.mybigcommerece.com';

        jest.spyOn(parentWindow, 'postMessage')
            .mockImplementation(() => {});

        messenger = new EmbeddedCheckoutMessenger({ parentOrigin, parentWindow });
    });

    it('posts `complete` event to parent window', () => {
        messenger.postComplete();

        expect(parentWindow.postMessage).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.CheckoutComplete,
        }, parentOrigin);
    });

    it('posts `complete` event to parent window', () => {
        const error = new CartChangedError();

        messenger.postError(error);

        expect(parentWindow.postMessage).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.CheckoutError,
            payload: {
                message: error.message,
                type: error.type,
            },
        }, parentOrigin);
    });

    it('posts `loaded` event to parent window', () => {
        messenger.postLoaded();

        expect(parentWindow.postMessage).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.CheckoutLoaded,
        }, parentOrigin);
    });

    it('posts `frame_loaded` event to parent window', () => {
        messenger.postFrameLoaded();

        expect(parentWindow.postMessage).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.FrameLoaded,
        }, parentOrigin);
    });

    it('posts `frame_error` event to parent window', () => {
        const error = new StandardError();

        messenger.postFrameError(error);

        expect(parentWindow.postMessage).toHaveBeenCalledWith({
            type: EmbeddedCheckoutEventType.FrameError,
            payload: {
                message: error.message,
                type: error.type,
            },
        }, parentOrigin);
    });
});
