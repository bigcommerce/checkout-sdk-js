import EmbeddedCheckoutMessenger from './embedded-checkout-messenger';
import EmbeddedCheckoutMessengerOptions from './embedded-checkout-messenger-options';

/**
 * Create an instance of `EmbeddedCheckoutMessenger`.
 *
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
 * Please note that this feature is currently in an early stage of development.
 * Therefore the API is unstable and not ready for public consumption.
 *
 * @alpha
 * @param options - Options for creating `EmbeddedCheckoutMessenger`
 * @returns - An instance of `EmbeddedCheckoutMessenger`
 */
export default function createEmbeddedCheckoutMessenger(options: EmbeddedCheckoutMessengerOptions): EmbeddedCheckoutMessenger {
    return new EmbeddedCheckoutMessenger(options);
}
