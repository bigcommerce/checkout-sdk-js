export * from '@square/web-payments-sdk-types';

export interface SquarePaymentMethodInitializationData {
    applicationId: string;
    locationId?: string;
}

export interface SquareInitializationData {
    cardId?: string;
}

export interface SquareFormattedVaultedInstrument {
    bigpay_token: {
        token: string;
        three_d_secure?: { token: string };
    };
    vault_payment_instrument: boolean;
    set_as_default_stored_instrument: boolean;
}
