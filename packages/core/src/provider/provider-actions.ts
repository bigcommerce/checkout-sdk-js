import { Action } from '@bigcommerce/data-store';

export enum ProviderCustomerDataType {
    ProviderCustomerDataCollected = 'PROVIDER_CUSTOMER_DATA_TYPE_COLLECTED',
}

export type ProviderCustomerDataAction = UpdateProviderCustomerDataAction;

export interface UpdateProviderCustomerDataAction<T = {}> extends Action<T> {
    type: ProviderCustomerDataType.ProviderCustomerDataCollected;
}
