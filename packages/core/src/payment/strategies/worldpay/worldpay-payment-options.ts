export interface WorldpayPaymentInitializeOptions {
    /**
     * A callback that gets called when the iframe is ready to be added to the
     * current page. It is responsible for determining where the iframe should
     * be inserted in the DOM.
     *
     * @param iframe - The iframe element containing the payment web page
     * provided by the strategy.
     * @param cancel - A function, when called, will cancel the payment
     * process and remove the iframe.
     */
    onLoad(iframe: HTMLIFrameElement, cancel: () => void): void;
}
