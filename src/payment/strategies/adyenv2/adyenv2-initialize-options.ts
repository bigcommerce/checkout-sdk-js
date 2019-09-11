import Omit from '../../../common/types/omit';

import { CreditCardComponentOptions, ThreeDS2ComponentOptions } from './adyenv2';

/**
 * A set of options that are required to initialize the AdyenV2 payment method.
 *
 * Once AdyenV2 payment is initialized, credit card form fields, provided by the
 * payment provider as iframes, will be inserted into the current page. These
 * options provide a location and styling for each of the form fields.
 */
export default interface AdyenV2PaymentInitializeOptions {
    /**
     * The location to insert the Adyen component.
     */
    containerId: string;

    /**
     * The location to insert the Adyen 3DS V2 component.
     */
    threeDS2ContainerId: string;

    /**
     * Optional. Overwriting the default options
     */
    options?: Omit<CreditCardComponentOptions, 'onChange'>;

    /**
     * Optional. Contains all three ds 2 options
     */
    threeDS2Options?: ThreeDS2ComponentOptions;
}
