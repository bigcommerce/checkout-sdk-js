import { Omit } from '../../../common/types';

import { AdyenAdditionalActionOptions, AdyenCreditCardComponentOptions, AdyenIdealComponentOptions, AdyenThreeDS2Options } from './adyenv2';

/**
 * A set of options that are required to initialize the AdyenV2 payment method.
 *
 * Once AdyenV2 payment is initialized, credit card form fields, provided by the
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
 *     methodId: 'adyenv2',
 *     adyenv2: {
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
 *     methodId: 'adyenv2',
 *     adyenv2: {
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
 *             bcmc: {
 *                 hasHolderName: true,
 *             },
 *             ideal: {
 *                 showImage: true,
 *             },
 *         },
 *     },
 * });
 * ```
 */
export default interface AdyenV2PaymentInitializeOptions {
    /**
     * The location to insert the Adyen component.
     */
    containerId: string;

    /**
     * @deprecated The location to insert the Adyen 3DS V2 component.
     * Use additionalActionOptions instead as this property will be removed in the future
     */
    threeDS2ContainerId: string;

    /**
     * The location to insert the Adyen custom card component
     */
    cardVerificationContainerId?: string;

    /**
     * True if the Adyen component has some Vaulted instrument
     */
    hasVaultedInstruments?: boolean;

    /**
     * @deprecated
     * Use additionalActionOptions instead as this property will be removed in the future
     */
    threeDS2Options: AdyenThreeDS2Options;

    /**
     * A set of options that are required to initialize additional payment actions.
     */
    additionalActionOptions: AdyenAdditionalActionOptions;

    /**
     * Optional. Overwriting the default options
     */
    options?: Omit<AdyenCreditCardComponentOptions, 'onChange'> | AdyenIdealComponentOptions;
}
