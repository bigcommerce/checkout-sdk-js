import { Action } from '@bigcommerce/data-store';

export enum ShippingStrategyActionType {
    UpdateAddressFailed = 'SHIPPING_STRATEGY_UPDATE_ADDRESS_FAILED',
    UpdateAddressRequested = 'SHIPPING_STRATEGY_UPDATE_ADDRESS_REQUESTED',
    UpdateAddressSucceeded = 'SHIPPING_STRATEGY_UPDATE_ADDRESS_SUCCEEDED',
    SelectOptionFailed = 'SHIPPING_STRATEGY_SELECT_OPTION_FAILED',
    SelectOptionRequested = 'SHIPPING_STRATEGY_SELECT_OPTION_REQUESTED',
    SelectOptionSucceeded = 'SHIPPING_STRATEGY_SELECT_OPTION_SUCCEEDED',
    InitializeFailed = 'SHIPPING_STRATEGY_INITIALIZE_FAILED',
    InitializeRequested = 'SHIPPING_STRATEGY_INITIALIZE_REQUESTED',
    InitializeSucceeded = 'SHIPPING_STRATEGY_INITIALIZE_SUCCEEDED',
    DeinitializeFailed = 'SHIPPING_STRATEGY_DEINITIALIZE_FAILED',
    DeinitializeRequested = 'SHIPPING_STRATEGY_DEINITIALIZE_REQUESTED',
    DeinitializeSucceeded = 'SHIPPING_STRATEGY_DEINITIALIZE_SUCCEEDED',
}

export type ShippingStrategyAction =
    ShippingStrategyUpdateAddressAction |
    ShippingStrategySelectOptionAction |
    ShippingStrategyInitializeAction |
    ShippingStrategyDeinitializeAction;

export type ShippingStrategyUpdateAddressAction =
    UpdateAddressRequestedAction |
    UpdateAddressSucceededAction |
    UpdateAddressFailedAction;

export type ShippingStrategySelectOptionAction =
    SelectOptionRequestedAction |
    SelectOptionSucceededAction |
    SelectOptionFailedAction;

export type ShippingStrategyInitializeAction =
    InitializeRequestedAction |
    InitializeSucceededAction |
    InitializeFailedAction;

export type ShippingStrategyDeinitializeAction =
    DeinitializeRequestedAction |
    DeinitializeSucceededAction |
    DeinitializeFailedAction;

export interface UpdateAddressRequestedAction extends Action {
    type: ShippingStrategyActionType.UpdateAddressRequested;
}

export interface UpdateAddressSucceededAction extends Action {
    type: ShippingStrategyActionType.UpdateAddressSucceeded;
}

export interface UpdateAddressFailedAction extends Action<Error> {
    type: ShippingStrategyActionType.UpdateAddressFailed;
}

export interface SelectOptionRequestedAction extends Action {
    type: ShippingStrategyActionType.SelectOptionRequested;
}

export interface SelectOptionSucceededAction extends Action {
    type: ShippingStrategyActionType.SelectOptionSucceeded;
}

export interface SelectOptionFailedAction extends Action<Error> {
    type: ShippingStrategyActionType.SelectOptionFailed;
}

export interface InitializeRequestedAction extends Action {
    type: ShippingStrategyActionType.InitializeRequested;
}

export interface InitializeSucceededAction extends Action {
    type: ShippingStrategyActionType.InitializeSucceeded;
}

export interface InitializeFailedAction extends Action<Error> {
    type: ShippingStrategyActionType.InitializeFailed;
}

export interface DeinitializeRequestedAction extends Action {
    type: ShippingStrategyActionType.DeinitializeRequested;
}

export interface DeinitializeSucceededAction extends Action {
    type: ShippingStrategyActionType.DeinitializeSucceeded;
}

export interface DeinitializeFailedAction extends Action<Error> {
    type: ShippingStrategyActionType.DeinitializeFailed;
}
