import { HostedFormOptions } from '../../../hosted-form';

import MonerisStylingProps from './moneris';

/**
 * A set of options that are required to initialize the Moneris payment method.
 *
 * Once Moneris payment is initialized, a credit card payment form is provided by the
 * payment provider as an IFrame, it will be inserted into the current page. These
 * options provide a location and styling for the payment form.
 *
 * ```js
 * service.initializePayment({
 *      methodId: 'moneris',
 *      moneris: {
 *          containerId: 'container',
 *          style : {
 *              cssBody: 'background:white;';
 *              cssTextbox: 'border-width:2px;';
 *              cssTextboxCardNumber: 'width:140px;';
 *              cssTextboxExpiryDate: 'width:40px;';
 *              cssTextboxCVV: 'width:40px';
 *          }
 *      }
 * });
 * ```
 */
export default interface MonerisPaymentInitializeOptions {
    /**
     * The ID of a container where the Moneris iframe component should be mounted
     */
    containerId: string;

    /**
     * The styling props to apply to the iframe component
     */
    style?: MonerisStylingProps;

    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormOptions;
}
