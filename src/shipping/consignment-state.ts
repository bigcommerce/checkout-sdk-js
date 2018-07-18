import Consignment from './consignment';

export default interface ConsignmentState {
    data?: Consignment[];
    errors: ConsignmentErrorsState;
    statuses: ConsignmentStatusesState;
}

export interface ConsignmentErrorsState {
    loadError?: Error;
    loadShippingOptionsError?: Error;
    createError?: Error;
    updateError: { [key: string]: Error | undefined };
    updateShippingOptionError: { [key: string]: Error | undefined };
}

export interface ConsignmentStatusesState {
    isLoading?: boolean;
    isLoadingShippingOptions?: boolean;
    isCreating?: boolean;
    isUpdating: { [key: string]: boolean };
    isUpdatingShippingOption: { [key: string]: boolean };
}
