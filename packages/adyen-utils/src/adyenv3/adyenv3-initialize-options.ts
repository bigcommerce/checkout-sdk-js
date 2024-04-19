import { Omit } from '@bigcommerce/checkout-sdk/payment-integration-api';

import {
    AdyenAdditionalActionOptions,
    AdyenCreditCardComponentOptions,
    AdyenValidationState,
} from '../types';

/**
 * A set of options that are required to initialize the Adyenv3 payment method.
 *
 * Once Adyenv3 payment is initialized, credit card form fields, provided by the
 * payment provider as IFrames, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 *
 * ```html
 * <!-- This is where the credit card component will be inserted -->
 * <div id="container"></div>
 *
 * <!-- This is where the secondary components (i.e.: 3DS) will be inserted -->
 * <div id="additional-action-container"></div>
 * ```
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'adyenv3',
 *     adyenv3: {
 *         containerId: 'container',
 *         additionalActionOptions: {
 *             containerId: 'additional-action-container',
 *         },
 *     },
 * });
 * ```
 *
 * Additional options can be passed in to customize the components and register
 * event callbacks.
 *
 * ```js
 * service.initializePayment({
 *     methodId: 'adyenv3',
 *     adyenv3: {
 *         containerId: 'container',
 *         additionalActionOptions: {
 *             containerId: 'additional-action-container',
 *             onBeforeLoad(shopperInteraction) {
 *                 console.log(shopperInteraction);
 *             },
 *             onLoad(cancel) {
 *                 console.log(cancel);
 *             },
 *             onComplete() {
 *                 console.log('Completed');
 *             },
 *         },
 *         options: {
 *             scheme: {
 *                 hasHolderName: true,
 *             },
 *         },
 *     },
 * });
 * ```
 */
export default interface AdyenV3PaymentInitializeOptions {
    /**
     * The location to insert the Adyen component.
     */
    containerId: string;

    /**
     * The location to insert the Adyen custom card component
     */
    cardVerificationContainerId?: string;

    /**
     * True if the Adyen component has some Vaulted instrument
     */
    hasVaultedInstruments?: boolean;

    /**
     * A set of options that are required to initialize additional payment actions.
     */
    additionalActionOptions: AdyenAdditionalActionOptions;

    /**
     * Optional. Overwriting the default options
     */
    options?: Omit<AdyenCreditCardComponentOptions, 'onChange'>;

    shouldShowNumberField?: boolean;

    validateCardFields(validateState: AdyenValidationState): void;
}

export interface WithAdyenV3PaymentInitializeOptions {
    /**
     * The options that are required to initialize the Apple Pay payment
     * method. They can be omitted unless you need to support Apple Pay.
     */
    adyenv3?: AdyenV3PaymentInitializeOptions;
}
