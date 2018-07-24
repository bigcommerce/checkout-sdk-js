import OrderReference from './amazon-pay-order-reference';
import WidgetError from './amazon-pay-widget-error';

export default interface AmazonPayWallet {
    bind(container: string): void;
}

export interface AmazonPayWalletConstructor {
    new(options: AmazonPayWalletOptions): AmazonPayWallet;
}

export interface AmazonPayWalletOptions {
    design: {
        designMode: string;
    };
    scope: string;
    sellerId: string;
    amazonOrderReferenceId?: string;
    onError(error: WidgetError): void;
    onReady(orderReference: OrderReference): void;
    onPaymentSelect(orderReference: OrderReference): void;
    onOrderReferenceCreate?(orderReference: OrderReference): void;
}
