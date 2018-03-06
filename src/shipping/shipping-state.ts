export default interface ShippingState {
    errors: ShippingErrorsState;
    statuses: ShippingStatusesState;
}

export interface ShippingErrorsState {
    initializeError?: any;
    initializeMethod?: string;
}

export interface ShippingStatusesState {
    initializingMethod?: string;
    isInitializing?: boolean;
}
