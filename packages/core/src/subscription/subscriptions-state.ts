export default interface SubscriptionsState {
    errors: SubscriptionsErrorsState;
    statuses: SubscriptionsStatusesState;
}

export interface SubscriptionsErrorsState {
    updateError?: Error;
}

export interface SubscriptionsStatusesState {
    isUpdating?: boolean;
}

export const DEFAULT_STATE: SubscriptionsState = {
    errors: {},
    statuses: {},
};
