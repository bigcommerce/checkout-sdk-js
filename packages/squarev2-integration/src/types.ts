export * from '@square/web-payments-sdk-types';

export interface SquarePaymentMethodInitializationData {
    applicationId: string;
    locationId?: string;
}

export interface SquareInitializationData {
    cardId?: string;
}

export interface SquareCreditCardTokens {
    nonce: string;
    token: string;
    store_card_nonce?: string;
    store_card_token?: string;
}

export interface SquareFormattedVaultedInstrument {
    bigpay_token: {
        token: string;
        three_d_secure?: { token: string };
    };
}
