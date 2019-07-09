import AmazonPayOrderReference from './amazon-pay-order-reference';
import AmazonPayWidgetError from './amazon-pay-widget-error';

export default interface AmazonPayWallet {
    bind(container: string): void;
}

export type AmazonPayWalletConstructor = new(options: AmazonPayWalletOptions) => AmazonPayWallet;

export interface AmazonPayWalletOptions {
    design: {
        designMode: string;
    };
    scope: string;
    sellerId: string;
    amazonOrderReferenceId?: string;
    onError(error: AmazonPayWidgetError): void;
    onReady(orderReference: AmazonPayOrderReference): void;
    onPaymentSelect(orderReference: AmazonPayOrderReference): void;
}
