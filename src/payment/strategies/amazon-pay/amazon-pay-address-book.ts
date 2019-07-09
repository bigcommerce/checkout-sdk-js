import AmazonPayOrderReference from './amazon-pay-order-reference';
import AmazonPayWidgetError from './amazon-pay-widget-error';

export default interface AmazonPayAddressBook {
    bind(container: string): void;
}

export type AmazonPayAddressBookConstructor = new(options: AmazonPayAddressBookOptions) => AmazonPayAddressBook;

export interface AmazonPayAddressBookOptions {
    design: {
        designMode: string;
    };
    scope: string;
    sellerId: string;
    onAddressSelect(orderReference: AmazonPayOrderReference): void;
    onError(error: AmazonPayWidgetError): void;
    onReady(orderReference: AmazonPayOrderReference): void;
}
