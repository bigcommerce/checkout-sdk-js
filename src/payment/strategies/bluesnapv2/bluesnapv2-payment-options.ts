import { BlueSnapV2StyleProps } from './bluesnapv2';

/**
 * A set of options that are required to initialize the BlueSnap V2 payment
 * method.
 *
 * The payment step is done through a web page via an iframe provided by the
 * strategy.
 */
export interface BlueSnapV2PaymentInitializeOptions {
    /**
     * A set of CSS properties to apply to the iframe.
     */
    style?: BlueSnapV2StyleProps;

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
