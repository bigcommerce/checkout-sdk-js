import { PickupOptionQueryMap } from './pickup-option';

export default interface PickupOptionState {
    data?: PickupOptionQueryMap;
    errors: PickupOptionErrorsState;
    statuses: PickupOptionStatusesState;
}

export interface PickupOptionErrorsState {
    loadError?: Error;
}

export interface PickupOptionStatusesState {
    isLoading?: boolean;
}

export const DEFAULT_STATE: PickupOptionState = {
    errors: {},
    statuses: {},
};
