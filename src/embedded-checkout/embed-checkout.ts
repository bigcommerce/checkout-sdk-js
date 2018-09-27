import EmbeddedCheckout from './embedded-checkout';
import EmbeddedCheckoutListener from './embedded-checkout-listener';
import EmbeddedCheckoutOptions from './embedded-checkout-options';
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
    const embeddedCheckout = new EmbeddedCheckout(
        new ResizableIframeCreator(),
        new EmbeddedCheckoutListener(parseOrigin(options.url)),
        options
    );

    return embeddedCheckout.attach();
}
