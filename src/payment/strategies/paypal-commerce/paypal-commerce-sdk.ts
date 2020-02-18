
export interface ApproveDataOptions {
    orderID: string;
}

export interface ButtonsOptions {
    enableStandardCardFields?: boolean;
    createOrder(): Promise<string>;
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
