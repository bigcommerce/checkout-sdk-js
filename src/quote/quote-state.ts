import InternalQuote from './internal-quote';

export default interface QuoteState {
    data?: InternalQuote;
    meta?: QuoteMetaState;
    errors: QuoteErrorsState;
    statuses: QuoteStatusesState;
}

export interface QuoteMetaState {
    request?: {
        geoCountryCode: string;
        deviceSessionId: string;
        sessionHash: string;
    };
}

export interface QuoteErrorsState {
    loadError?: Error;
    updateBillingAddressError?: Error;
    updateShippingAddressError?: Error;
}

export interface QuoteStatusesState {
    isLoading?: boolean;
    isUpdatingBillingAddress?: boolean;
    isUpdatingShippingAddress?: boolean;
}
