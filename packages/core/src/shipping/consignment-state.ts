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
    updateError: Record<string, Error | undefined>;
    deleteError: Record<string, Error | undefined>;
    updateShippingOptionError: Record<string, Error | undefined>;
}

export interface ConsignmentStatusesState {
    isLoading?: boolean;
    isLoadingShippingOptions?: boolean;
    isCreating?: boolean;
    isUpdating: Record<string, boolean>;
    isDeleting: Record<string, boolean>;
    isUpdatingShippingOption: Record<string, boolean>;
}

export const DEFAULT_STATE: ConsignmentState = {
    errors: {
        updateShippingOptionError: {},
        updateError: {},
        deleteError: {},
    },
    statuses: {
        isUpdating: {},
        isUpdatingShippingOption: {},
        isDeleting: {},
    },
};
