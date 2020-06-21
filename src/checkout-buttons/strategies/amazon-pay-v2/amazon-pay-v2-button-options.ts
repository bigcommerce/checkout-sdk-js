import { AmazonPayV2ButtonParams } from '../../../payment/strategies/amazon-pay-v2';

export interface AmazonPayV2ButtonInitializeOptions {
    /**
     * @alpha
     */
    containerId: string;

    /**
     * A set of options to render the AmazonPayV2 checkout button.
     * @alpha
     */
    options: AmazonPayV2ButtonParams;
}
