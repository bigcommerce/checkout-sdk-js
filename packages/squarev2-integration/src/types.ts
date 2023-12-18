export * from '@square/web-payments-sdk-types';

export interface SquarePaymentMethodInitializationData {
    applicationId: string;
    locationId?: string;
}

export enum SquareIntent {
    CHARGE = 'CHARGE',
    STORE = 'STORE',
}
