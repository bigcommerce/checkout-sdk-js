export * from '@square/web-payments-sdk-types';

interface SquareCardsData {
    token: string;
    id: string;
}

export interface SquarePaymentMethodInitializationData {
    applicationId: string;
    locationId?: string;
    providerData?: {
        squareCardsData: SquareCardsData[][];
    };
}
