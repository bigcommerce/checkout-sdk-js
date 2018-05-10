import { InternalShippingOptionList } from './internal-shipping-option';

export default interface ShippingOptionState {
    data?: InternalShippingOptionList;
    errors: ShippingOptionErrorsState;
    statuses: ShippingOptionStatusesState;
}

export interface ShippingOptionErrorsState {
    loadError?: Error;
}

export interface ShippingOptionStatusesState {
    isLoading?: boolean;
}
