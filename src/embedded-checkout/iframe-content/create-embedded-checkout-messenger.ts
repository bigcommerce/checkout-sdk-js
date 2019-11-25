import { setupContentWindowForIframeResizer, IframeEventListener, IframeEventPoster } from '../../common/iframe';
import { EmbeddedCheckoutEvent, EmbeddedCheckoutEventType } from '../embedded-checkout-events';

import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';
import EmbeddedCheckoutMessengerOptions from './embedded-checkout-messenger-options';
import { EmbeddedContentEventMap } from './embedded-content-events';
import handleFrameLoadedEvent from './handle-frame-loaded-event';
import IframeEmbeddedCheckoutMessenger from './iframe-embedded-checkout-messenger';
import NoopEmbeddedCheckoutMessenger from './noop-embedded-checkout-messenger';

/**
 * Create an instance of `EmbeddedCheckoutMessenger`.
 *
 * @remarks
 * The object is responsible for posting messages to the parent window from the
 * iframe when certain events have occurred. For example, when the checkout
 * form is first loaded, you should notify the parent window about it.
 *
 * The iframe can only be embedded in domains that are allowed by the store.
 *
 * ```ts
 * const messenger = createEmbeddedCheckoutMessenger({
 *     parentOrigin: 'https://some/website',
 * });
 *
 * messenger.postFrameLoaded();
 * ```
 *
 * @alpha
 * Please note that this feature is currently in an early stage of development.
 * Therefore the API is unstable and not ready for public consumption.
 *
 * @param options - Options for creating `EmbeddedCheckoutMessenger`
 * @returns - An instance of `EmbeddedCheckoutMessenger`
 */
export default function createEmbeddedCheckoutMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger {
    setupContentWindowForIframeResizer();

    const parentWindow = options.parentWindow || window.parent;

    // Return a No-op messenger if it is not called inside an iframe
    if (window === parentWindow) {
        return new NoopEmbeddedCheckoutMessenger();
    }

    return new IframeEmbeddedCheckoutMessenger(
        new IframeEventListener<EmbeddedContentEventMap>(options.parentOrigin),
        new IframeEventPoster<EmbeddedCheckoutEvent>(options.parentOrigin, parentWindow),
        new IframeEventPoster<EmbeddedCheckoutEvent>('*', parentWindow),
        { [EmbeddedCheckoutEventType.FrameLoaded]: handleFrameLoadedEvent }
    );
}
