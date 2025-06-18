import { LineItem } from '../stripe-utils';

export interface StripeLinkV2Event {
    value?: null;
    billingDetails?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
            line1?: string;
            city?: string;
            country?: string;
            postal_code?: string;
            state?: string;
        };
    };
    shippingAddress?: {
        name?: string;
        address?: {
            line1?: string;
            line2?: string;
            city?: string;
            country?: string;
            postal_code?: string;
            state?: string;
        };
    };
    address?: {
        line1?: string;
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
