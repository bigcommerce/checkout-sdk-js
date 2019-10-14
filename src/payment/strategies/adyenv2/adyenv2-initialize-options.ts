import { Omit } from '../../../common/types';

import { AdyenCreditCardComponentOptions, AdyenThreeDS2Options } from './adyenv2';

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
     * ThreeDS2Options
     */
    threeDS2Options: AdyenThreeDS2Options;

    /**
     * Optional. Overwriting the default options
     */
    options?: Omit<AdyenCreditCardComponentOptions, 'onChange'>;
}
