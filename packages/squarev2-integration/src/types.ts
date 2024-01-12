export * from '@square/web-payments-sdk-types';

interface SquareCardsData {
    bigpay_token: string;
    provider_card_token: string;
}

export interface SquarePaymentMethodInitializationData {
    applicationId: string;
    locationId?: string;
    providerData?: {
        squareCardsData: SquareCardsData[];
    };
}
