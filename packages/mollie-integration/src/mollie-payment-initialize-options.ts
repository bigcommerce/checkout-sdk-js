import { HostedFormOptions } from '@bigcommerce/checkout-sdk/payment-integration-api';

/**
 * A set of options that are required to initialize the Mollie payment method.
 *
 * Once Mollie payment is initialized, credit card form fields are provided by the
 * payment provider as IFrames, these will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```js
 * service.initializePayment({
 *      methodId: 'mollie',
 *      mollie: {
 *          containerId: 'container',
 *          cardNumberId: '',
 *          cardHolderId: '',
 *          cardCvcId: '',
 *          cardExpiryId: '',
 *          styles : {
 *              base: {
 *                  color: '#fff'
 *              }
 *          }
 *      }
 * });
 * ```
 */
export default interface MolliePaymentInitializeOptions {
    /**
     * ContainerId is use in Mollie for determined either its showing or not the
     * container, because when Mollie has Vaulted Instruments it gets hide,
     * and shows an error because can't mount Provider Components
     */
    containerId?: string;

    /**
     * The location to insert Mollie Component
     */
    cardNumberId: string;

    /**
     * The location to insert Mollie Component
     */
    cardHolderId: string;

    /**
     * The location to insert Mollie Component
     */
    cardCvcId: string;

    /**
     * The location to insert Mollie Component
     */
    cardExpiryId: string;

    /**
     * A set of styles required for the mollie components
     */
    styles: object;

    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormOptions;

    unsupportedMethodMessage?: string;

    disableButton(disabled: boolean): void;
}

export interface WithMolliePaymentInitializeOptions {
    /**
     * The options that are required to initialize the Mollie payment
     * method. They can be omitted unless you need to support Mollie.
     */
    mollie?: MolliePaymentInitializeOptions;
}
