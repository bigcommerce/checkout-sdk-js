import Consignment from './consignment';

export default interface ConsignmentState {
    data?: Consignment[];
    errors: ConsignmentErrorsState;
    statuses: ConsignmentStatusesState;
}

export interface ConsignmentErrorsState {
    loadError?: Error;
    createError?: Error;
    updateError?: Error;
}

export interface ConsignmentStatusesState {
    isLoading?: boolean;
    isCreating?: boolean;
    isUpdating?: boolean;
}
