
interface ApproveDataOptions {
    orderID: string;
}

interface ButtonsOptions {
    enableStandardCardFields?: boolean;
    createOrder(data: any): void;
    onApprove(data: ApproveDataOptions): void;
}

export interface PaypalCommerceSDK {
    Buttons({createOrder, onApprove}: ButtonsOptions): {
        render(id: string): void;
    };
}

export interface PaypalCommerceHostWindow extends Window {
    paypal?: PaypalCommerceSDK;
}
