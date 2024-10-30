import {
    Address,
    StripeElement,
    StripeElements,
    StripeElementType,
    StripeStringConstants,
    StripeUPEClient,
} from '../stripe-upe/stripe-upe';

export type StripeExpressCheckoutElementEvent = 'click' | 'shippingaddresschange';

export interface StripeExpressCheckoutClient extends Omit<StripeUPEClient, 'elements'> {
    elements(options: StripeExpressCheckoutOptions): StripeExpressCheckoutElements;
}

export interface StripeExpressCheckoutElements extends Omit<StripeElements, 'create' | 'update'> {
    create(
        elementType: StripeElementType,
        options?: StripeExpressCheckoutElementCreateOptions,
    ): StripeExpressCheckoutElement;
    update(options?: StripeExpressCheckoutUpdateOptions): StripeExpressCheckoutElement;
}

export interface StripeExpressCheckoutElement extends Omit<StripeElement, 'on' | 'update'> {
    on(event: StripeExpressCheckoutElementEvent, handler: (event: StripeLinkV2Event) => void): void;

    update(options?: StripeExpressCheckoutElementCreateOptions): void;
}

export interface StripeExpressCheckoutElementCreateOptions {
    paymentMethods?: {
        link: StripeStringConstants.AUTO;
        applePay: StripeStringConstants.NEVER;
        googlePay: StripeStringConstants.NEVER;
        amazonPay: StripeStringConstants.NEVER;
        paypal: StripeStringConstants.NEVER;
    };
    buttonHeight?: number;
}

export interface StripeLinkV2Event {
    address?: Address;
    elementType: string;
    expressPaymentType: string;
    resolve(data: StripeLinkV2EventResolveData): void;
}

export interface StripeLinkV2EventResolveData {
    allowedShippingCountries?: string[];
    shippingAddressRequired?: boolean;
    shippingRates?: StripeLinkV2ShippingRates[];
    billingAddressRequired?: boolean;
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
}

export interface StripeLinkV2ShippingRates {
    id: string;
    amount: number;
    displayName: string;
}

export interface StripeExpressCheckoutOptions {
    clientSecret?: string;
    mode?: string;
    currency?: string;
    amount?: number;
}
export interface StripeExpressCheckoutUpdateOptions {
    mode?: string;
    currency?: string;
    amount?: number;
}
