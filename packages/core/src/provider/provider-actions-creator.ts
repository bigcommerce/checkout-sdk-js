import { createAction } from '@bigcommerce/data-store';
import { Observable, of } from 'rxjs';

import { ProviderCustomerDataAction, ProviderCustomerDataType } from './provider-actions';

export default class ProviderCustomerDataActionCreator {
    updateProviderCustomerData<T = object>(
        providerCustomerData: T,
    ): Observable<ProviderCustomerDataAction> {
        return of(
            createAction(
                ProviderCustomerDataType.ProviderCustomerDataCollected,
                providerCustomerData,
            ),
        );
    }
}
