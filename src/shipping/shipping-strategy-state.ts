export default interface ShippingStrategyState {
    errors: ShippingStrategyErrorsState;
    statuses: ShippingStrategyStatusesState;
}

export interface ShippingStrategyErrorsState {
    deinitializeError?: Error;
    deinitializeMethodId?: string;
    initializeError?: Error;
    initializeMethodId?: string;
    updateAddressError?: Error;
    updateAddressMethodId?: string;
    selectOptionError?: Error;
    selectOptionMethodId?: string;
}

export interface ShippingStrategyStatusesState {
    deinitializeMethodId?: string;
    initializeMethodId?: string;
    isDeinitializing?: boolean;
    isInitializing?: boolean;
    isUpdatingAddress?: boolean;
    isSelectingOption?: boolean;
    updateAddressMethodId?: string;
    selectOptionMethodId?: string;
}

export const DEFAULT_STATE: ShippingStrategyState = {
    errors: {},
    statuses: {},
};
