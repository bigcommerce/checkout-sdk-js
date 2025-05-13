import {
    Address,
    StripeConfirmPaymentData,
    StripeElement,
    StripeElements,
    StripeElementType,
    StripeStringConstants,
    StripeUPEClient,
    StripeUpeResult,
} from '../stripe-upe/stripe-upe';

export type StripeExpressCheckoutElementEvent =
    | 'click'
    | 'shippingaddresschange'
    | 'shippingratechange'
    | 'confirm';

export interface StripeExpressCheckoutClient extends Omit<StripeUPEClient, 'elements' | 'confirmPayment'> {
    elements(options: StripeExpressCheckoutOptions): StripeExpressCheckoutElements;
    confirmPayment(options: StripeExpressCheckoutConfirmPaymentData): Promise<StripeUpeResult>;
}

export interface StripeExpressCheckoutConfirmPaymentData extends Omit<StripeConfirmPaymentData, 'elements'> {
    elements: StripeExpressCheckoutElements;
    clientSecret?: string;
}

export interface StripeExpressCheckoutElements extends Omit<StripeElements, 'create' | 'update'> {
    create(
        elementType: StripeElementType,
        options?: StripeExpressCheckoutElementCreateOptions,
    ): StripeExpressCheckoutElement;
    update(options?: StripeExpressCheckoutOptions): StripeExpressCheckoutElement;
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
    shippingRate?: StripeLinkV2ShippingRate;
    elementType: string;
    expressPaymentType: string;
    resolve(data: StripeLinkV2EventResolveData): void;
}

export interface StripeLinkV2EventResolveData {
    allowedShippingCountries?: string[];
    shippingAddressRequired?: boolean;
    shippingRates?: StripeLinkV2ShippingRate[];
    billingAddressRequired?: boolean;
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
}

export interface StripeLinkV2ShippingRate {
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

export interface StripeLinkV2ShippingRate {}
