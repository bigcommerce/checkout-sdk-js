import { PaymentMethod } from '@bigcommerce/checkout-sdk/payment-integration-api';

export interface AdditionalActionRequired {
    type: AdditionalActionType;
    data: AdditionalRedirectData;
}

export interface AdditionalRedirectData {
    redirect_url: string;
    transaction_id?: string;
}

export enum AdditionalActionType {
    OffsiteRedirect = 'offsite_redirect',
}

export function getCheckoutcom(): PaymentMethod {
    return {
        id: 'checkoutcom',
        logoUrl: '',
        method: 'checkoutcom',
        supportedCards: [],
        config: {
            displayName: 'Checkout.com',
            merchantId: '',
            testMode: true,
        },
        initializationData: {
            checkoutcomkey: 'key',
        },
        type: 'PAYMENT_TYPE_API',
        clientToken: 'clientToken',
    };
}

export interface WithDocumentInstrument {
    ccDocument: string;
}

export interface WithCheckoutcomSEPAInstrument {
    iban: string;
    bic: string;
}

export interface WithCheckoutcomFawryInstrument {
    customerMobile: string;
    customerEmail: string;
}
