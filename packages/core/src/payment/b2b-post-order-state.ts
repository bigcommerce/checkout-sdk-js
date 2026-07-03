export interface B2BPostOrderData {
    receiptId: string;
}

export default interface B2BPostOrderState {
    data?: B2BPostOrderData;
    errors: B2BPostOrderErrorsState;
    statuses: B2BPostOrderStatusesState;
}

export interface B2BPostOrderErrorsState {
    persistB2bMetadataError?: Error;
}

export interface B2BPostOrderStatusesState {
    isPersisting?: boolean;
}

export const DEFAULT_STATE: B2BPostOrderState = {
    errors: {},
    statuses: {},
};
