import { GooglePayConfig } from '../types';

export type FundingType = string[];
export type EnableFundingType = FundingType | string;

/**
 *
 * BigCommercePayments SDK
 *
 */
export interface PayPalSDK {
    Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (confirmOrderConfig: ConfirmOrderConfig) => Promise<{ status: string }>;
        initiatePayerAction: (payerActionConfig: PayerActionConfig) => Promise<void>;
    };
}

interface ConfirmOrderConfig {
    orderId: string;
    paymentMethodData: ConfirmOrderData;
}

interface PayerActionConfig {
    orderId: string;
}

export enum ConfirmOrderStatus {
    Approved = 'APPROVED',
    PayerActionRequired = 'PAYER_ACTION_REQUIRED',
}

export interface BigCommercePaymentsHostWindow extends Window {
    paypal?: PayPalSDK;
}

export interface BigCommercePaymentsScriptParams {
    options: {
        'client-id'?: string;
        'merchant-id'?: string;
        'buyer-country'?: string;
        'disable-funding'?: FundingType;
        'enable-funding'?: EnableFundingType;
        currency?: string;
        commit?: boolean;
        intent?: BigCommercePaymentsIntent;
        components?: ComponentsScriptType;
    };
    attributes: {
        'data-client-token'?: string;
        'data-partner-attribution-id'?: string;
    };
}

export enum BigCommercePaymentsIntent {
    AUTHORIZE = 'authorize',
    CAPTURE = 'capture',
}

export type ComponentsScriptType = Array<
    | 'buttons'
    | 'funding-eligibility'
    | 'hosted-fields'
    | 'messages'
    | 'payment-fields'
    | 'legal'
    | 'googlepay'
    | 'card-fields'
>;

export interface PayPalGoogleSdk {
    version: string;
    getCorrelationID: () => void;
    Googlepay: () => {
        config: () => Promise<GooglePayConfig>;
        confirmOrder: (arg0: {
            orderId: string;
            paymentMethodData: ConfirmOrderData;
        }) => Promise<{ status: string }>;
        initiatePayerAction: () => void;
    };
    FUNDING: Record<string, string>;
}

export interface ConfirmOrderData {
    tokenizationData: {
        type: string;
        token: string;
    };
    info: {
        cardNetwork: string;
        cardDetails: string;
    };
    type: string;
}
