import { BraintreeVerifyPayload } from './braintree';

/**
 * A set of options that are required to initialize the Braintree payment
 * method. You need to provide the options if you want to support 3D Secure
 * authentication flow.
 */
export interface BraintreePaymentInitializeOptions {
    threeDSecure?: BraintreeThreeDSecureOptions;
}

/**
 * A set of options that are required to support 3D Secure authentication flow.
 *
 * If the customer uses a credit card that has 3D Secure enabled, they will be
 * asked to verify their identity when they pay. The verification is done
 * through a web page via an iframe provided by the card issuer.
 */
export interface BraintreeThreeDSecureOptions {
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param error - Any error raised during the verification process;
     * undefined if there is none.
     * @param iframe - The iframe element containing the verification web page
     * provided by the card issuer.
     * @param cancel - A function, when called, will cancel the verification
     * process and remove the iframe.
     */
    addFrame(error: Error | undefined, iframe: HTMLIFrameElement, cancel: () => Promise<BraintreeVerifyPayload> | undefined): void;

    /**
     * A callback that gets called when the iframe is about to be removed from
     * the current page.
     */
    removeFrame(): void;
}
