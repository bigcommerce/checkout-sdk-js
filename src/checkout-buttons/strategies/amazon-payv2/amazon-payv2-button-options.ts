import { AmazonPayv2ButtonParams } from '../../../payment/strategies/amazon-payv2';

export interface AmazonPayV2ButtonInitializeOptions {
    containerId: string;
    options: AmazonPayv2ButtonParams;
}
