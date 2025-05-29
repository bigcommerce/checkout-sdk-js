import {
    StripeConfirmPaymentData,
    StripeElement,
    StripeElements,
    StripeElementType,
    StripeStringConstants,
    StripeClient,
    StripeResult,
} from '../stripe-utils/stripe';

export enum StripeLinkV2ElementEvent {
    CLICK = 'click',
    SHIPPING_ADDRESS_CHANGE = 'shippingaddresschange',
    SHIPPING_RATE_CHANGE = 'shippingratechange',
    CONFIRM = 'confirm',
}

export interface StripeLinkV2Client extends Omit<StripeClient, 'elements' | 'confirmPayment'> {
    elements(options: StripeLinkV2Options): StripeLinkV2Elements;
    confirmPayment(options: StripeLinkV2ConfirmPaymentData): Promise<StripeResult>;
}

export interface StripeLinkV2ConfirmPaymentData extends Omit<StripeConfirmPaymentData, 'elements'> {
    elements: StripeLinkV2Elements;
    clientSecret?: string;
}

export interface StripeLinkV2Elements extends Omit<StripeElements, 'create' | 'update'> {
    create(
        elementType: StripeElementType,
        options?: StripeLinkV2ElementCreateOptions,
    ): StripeLinkV2Element;
    update(options?: StripeLinkV2Options): StripeLinkV2Element;
}

export interface StripeLinkV2Element extends Omit<StripeElement, 'on' | 'update'> {
    on(event: StripeLinkV2ElementEvent, handler: (event: StripeLinkV2Event) => void): void;

    update(options?: StripeLinkV2ElementCreateOptions): void;
}

export interface LineItem {
    name: string;
    amount: number;
}

export interface StripeLinkV2ElementCreateOptions {
    lineItems?: LineItem[];
    allowedShippingCountries?: string[];
    shippingAddressRequired?: boolean;
    shippingRates?: StripeLinkV2ShippingRate[];
    billingAddressRequired?: boolean;
    emailRequired?: boolean;
    phoneNumberRequired?: boolean;
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
    address?: {
        city?: string;
        country?: string;
        postal_code?: string;
        state?: string;
    };
    shippingRate?: StripeLinkV2ShippingRate;
    elementType: string;
    expressPaymentType: string;
    resolve(data: StripeLinkV2EventResolveData): void;
}

export interface StripeLinkV2EventResolveData {
    lineItems?: LineItem[];
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

export interface StripeLinkV2Options {
    clientSecret?: string;
    mode?: string;
    currency?: string;
    amount?: number;
}
