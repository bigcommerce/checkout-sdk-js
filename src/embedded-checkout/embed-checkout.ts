import EmbeddedCheckout from './embedded-checkout';
import { EmbeddedCheckoutEventMap } from './embedded-checkout-events';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
import { EmbeddedContentEvent } from './iframe-content/embedded-content-events';
import IframeEventListener from './iframe-event-listener';
import IframeEventPoster from './iframe-event-poster';
import parseOrigin from './parse-origin';
import ResizableIframeCreator from './resizable-iframe-creator';

/**
 * Embed the checkout form in an iframe.
 *
 * Once the iframe is embedded, it will automatically resize according to the
 * size of the checkout form. It will also notify the parent window when certain
 * events have occurred. i.e.: when the form is loaded and ready to be used.
 *
 * ```js
 * embedCheckout({
 *     url: 'https://checkout/url',
 *     container: 'container-id',
 * });
 * ```
 *
 * Please note that this feature is currently in an early stage of development.
 * Therefore the API is unstable and not ready for public consumption.
 *
 * @alpha
 * @param options - Options for embedding the checkout form.
 * @returns A promise that resolves to an instance of `EmbeddedCheckout`.
 */
export default function embedCheckout(options: EmbeddedCheckoutOptions): Promise<EmbeddedCheckout> {
    const origin = parseOrigin(options.url);
    const embeddedCheckout = new EmbeddedCheckout(
        new ResizableIframeCreator(),
        new IframeEventListener<EmbeddedCheckoutEventMap>(origin),
        new IframeEventPoster<EmbeddedContentEvent>(origin),
        options
    );

    return embeddedCheckout.attach();
}
