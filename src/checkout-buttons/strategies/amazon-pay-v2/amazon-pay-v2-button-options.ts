import { AmazonPayV2ButtonParams } from '../../../payment/strategies/amazon-pay-v2';

export interface AmazonPayV2ButtonInitializeOptions {
    containerId: string;
    options: AmazonPayV2ButtonParams;
}
