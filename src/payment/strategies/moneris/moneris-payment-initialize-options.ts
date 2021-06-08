import { HostedFormValidationOptions } from '../../../hosted-form';

import MonerisStylingProps from './moneris';

export default interface MonerisPaymentInitializeOptions {
    /**
     * The ID of a container where the Moneris iframe component should be mounted
     */
    containerId: string;

    style?: MonerisStylingProps;

    /**
     * Hosted Form Validation Options
     */
    form?: HostedFormValidationOptions;
}
