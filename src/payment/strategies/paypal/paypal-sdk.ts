export interface PaypalSDK {
    Button: PaypalButton;
    checkout: PaypalExpressCheckout;
}

export interface PaypalButton {
    render(options: PaypalButtonOptions, container: string): void;
}

export interface PaypalButtonOptions {
    env?: string;
    commit?: boolean;
    style?: PaypalButtonStyleOptions;
    payment(): Promise<any>;
    onAuthorize(data: PaypalAuthorizeData): Promise<any>;
}

export interface PaypalButtonStyleOptions {
    size?: 'small' | 'medium' | 'large' | 'responsive';
    color?: 'gold' | 'blue' | 'silver' | 'black';
    label?: 'credit' | 'checkout';
    shape?: 'pill' | 'rect';
}

export interface PaypalAuthorizeData {
    payerId: string;
    paymentId?: string;
    billingToken?: string;
}

export interface PaypalExpressCheckout {
    initXO(): void;
    startFlow(url: string): void;
    closeFlow(): void;
    setup(merchantId: string, options: PaypalExpressCheckoutOptions): void;
}

export interface PaypalExpressCheckoutOptions {
    button: string;
    environment: string;
}

export interface PaypalHostWindow extends Window {
    paypal?: PaypalSDK;
}
