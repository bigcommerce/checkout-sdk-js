export interface StripeSDK {
    source: {
        create(stripeCardSource: StripeCardSource, Function: any): Promise<void>;
        poll(id: string, secret: string, Function: any): Promise<void>;
    };
    setPublishableKey(publishableKey: string): void;
}

export interface StripeCardSource {
    type: string;
    card?: {
        number: string;
        cvc: string;
        exp_month: string;
        exp_year: string;
    };
    amount?: any;
    currency?: any;
    three_d_secure?: {
        card: any;
    };
    redirect?: any;
}

export interface StripeHostWindow extends Window {
    Stripe?: StripeSDK;
}
